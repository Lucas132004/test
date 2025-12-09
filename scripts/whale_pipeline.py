"""
Whale Flow Pipeline

Phases:
1) Whale Radar - Flow Detection
2) Smart Hedge Filter - Flow Sentiment
3) IV Filter & Strike Selection
4) Narrative Validation & Risk Check
5) Strategy Builder & Time Buffer
6) Final Rankings & P&L
"""

from __future__ import annotations

from typing import Dict, List, Any, Tuple, Optional

from datetime import datetime, timedelta
import time

import pandas as pd

# ---------------------------------------------------------------------
# GLOBAL CLIENTS (YOU MUST INJECT/INITIALIZE THESE IN YOUR ENV)
# ---------------------------------------------------------------------
# Example:
#   from your_sdk import XynthClient, XynthUnifiedSearchClient
#   xynth_client = XynthClient(api_key="...")
#   xynth_unified_search_client = XynthUnifiedSearchClient(api_key="...")
# ---------------------------------------------------------------------

xynth_client = None               # <-- set me before running
xynth_unified_search_client = None  # <-- set me before running


# ---------------------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------------------

def _collect_numeric_strikes(series: pd.Series) -> List[float]:
    """
    Aggregate strikes into a sorted list of unique numeric values.
    """
    return sorted({float(x) for x in series.dropna().tolist() if pd.notna(x)})


def _ensure_df(result: Any) -> pd.DataFrame:
    """
    Normalize various potential result shapes into a DataFrame.
    Handles: None, DataFrame, dict with 'data', list of dicts, etc.
    """
    if result is None:
        return pd.DataFrame()

    if isinstance(result, pd.DataFrame):
        return result

    if isinstance(result, dict):
        data = result.get("data", result)
        if isinstance(data, pd.DataFrame):
            return data
        if isinstance(data, list):
            return pd.DataFrame(data)
        # last resort: treat dict as single-row
        return pd.DataFrame([data])

    if isinstance(result, list):
        if not result:
            return pd.DataFrame()
        if isinstance(result[0], dict):
            return pd.DataFrame(result)
        return pd.DataFrame(result)

    return pd.DataFrame()


# ---------------------------------------------------------------------
# PHASE 1A: Fetch Raw Whale Alerts
# ---------------------------------------------------------------------

def fetch_whale_alerts(config: Dict) -> pd.DataFrame:
    """
    Fetch flow alerts from Unusual Whales using xynth_client.

    Args:
        config: Dictionary with filters (limit, min_premium, max_dte, etc.)

    Returns:
        DataFrame of raw flow alerts
    """
    print("\n" + "=" * 80)
    print("PHASE 1A: Fetching Raw Whale Alerts")
    print("=" * 80)

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    params: Dict[str, Any] = {}

    if config.get("ticker_symbol"):
        params["ticker_symbol"] = config["ticker_symbol"]
    if config.get("limit") is not None:
        params["limit"] = int(config["limit"])
    if config.get("min_premium") is not None:
        params["min_premium"] = int(config["min_premium"])
    if config.get("min_size") is not None:
        params["min_size"] = int(config["min_size"])
    if config.get("max_dte") is not None:
        params["max_dte"] = int(config["max_dte"])

    rule_names = config.get("rule_names")
    if rule_names:
        params["rule_name"] = list(rule_names)

    print("\nRequest parameters:")
    for key, val in params.items():
        print(f"  {key}: {val}")

    alerts_df = xynth_client.get_flow_alerts(**params)
    alerts_df = _ensure_df(alerts_df)

    if alerts_df is None or len(alerts_df) == 0:
        print("\n❌ No flow alerts found with current config.")
        return pd.DataFrame()

    print(f"\n✅ Fetched {len(alerts_df)} flow alerts.")

    # Quick sanity check: top tickers by total_premium if available
    if "ticker" in alerts_df.columns and "total_premium" in alerts_df.columns:
        top = (
            alerts_df.groupby("ticker")["total_premium"]
            .sum()
            .sort_values(ascending=False)
            .head(10)
        )
        print("\nTop 10 tickers by total premium:")
        for ticker, prem in top.items():
            print(f"  {ticker:8s} ${prem:,.0f}")
    else:
        print("\nSample of raw alerts:")
        print(alerts_df.head())

    return alerts_df


# ---------------------------------------------------------------------
# PHASE 1B: Build Whale Clusters
# ---------------------------------------------------------------------

def build_whale_clusters(alerts_df: pd.DataFrame) -> pd.DataFrame:
    """
    Group raw alerts into whale clusters.

    Cluster keys: ticker, expiry (if available), direction (CALL/PUT).
    Aggregates: total_premium, trade_count, avg volume_oi_ratio, list of strikes.

    Args:
        alerts_df: Raw flow alerts DataFrame

    Returns:
        DataFrame of aggregated whale clusters
    """
    print("\n" + "=" * 80)
    print("PHASE 1B: Building Whale Clusters")
    print("=" * 80)

    if alerts_df is None or alerts_df.empty:
        print("\n❌ No alerts to cluster.")
        return pd.DataFrame()

    df = alerts_df.copy()

    # Derive direction column from type/contract_type if present
    direction_source: Optional[str] = None
    for col_name in ["type", "contract_type"]:
        if col_name in df.columns:
            direction_source = col_name
            break

    if direction_source is not None:
        df["direction"] = (
            df[direction_source]
            .astype(str)
            .str.upper()
            .map(lambda x: "CALL" if "C" in x else ("PUT" if "P" in x else "UNKNOWN"))
        )
    else:
        df["direction"] = "UNKNOWN"

    # Choose expiry column if available
    expiry_col: Optional[str] = None
    for col_name in ["expiry", "expiration_date", "expiration"]:
        if col_name in df.columns:
            expiry_col = col_name
            break

    # Choose premium column
    premium_col: Optional[str] = None
    for col_name in ["total_premium", "premium"]:
        if col_name in df.columns:
            premium_col = col_name
            break

    # Choose strike column
    strike_col: Optional[str] = None
    for col_name in ["strike", "strike_price"]:
        if col_name in df.columns:
            strike_col = col_name
            break

    if "ticker" not in df.columns:
        print("\n❌ Ticker column missing, cannot build clusters.")
        return pd.DataFrame()

    group_cols = ["ticker", "direction"]
    if expiry_col:
        group_cols.append(expiry_col)

    agg_dict: Dict[str, Any] = {}
    if premium_col:
        agg_dict[premium_col] = "sum"
    if "trade_count" in df.columns:
        agg_dict["trade_count"] = "sum"
    if "volume_oi_ratio" in df.columns:
        agg_dict["volume_oi_ratio"] = "mean"
    if strike_col:
        agg_dict[strike_col] = _collect_numeric_strikes

    clusters = df.groupby(group_cols).agg(agg_dict).reset_index()

    # Normalize column names
    rename_map: Dict[str, str] = {}
    if expiry_col and expiry_col in clusters.columns:
        rename_map[expiry_col] = "expiry"
    if premium_col and premium_col in clusters.columns:
        rename_map[premium_col] = "total_premium"
    if strike_col and strike_col in clusters.columns:
        rename_map[strike_col] = "whale_strikes"

    if rename_map:
        clusters = clusters.rename(columns=rename_map)

    # Sort by total_premium if available
    if "total_premium" in clusters.columns:
        clusters = clusters.sort_values("total_premium", ascending=False)

    print(f"\n✅ Built {len(clusters)} whale clusters.")

    # Display summary
    if not clusters.empty:
        print("\nTop 20 clusters by total premium:")
        display_cols = ["ticker", "direction"]
        if "expiry" in clusters.columns:
            display_cols.append("expiry")
        if "total_premium" in clusters.columns:
            display_cols.append("total_premium")
        if "trade_count" in clusters.columns:
            display_cols.append("trade_count")
        if "whale_strikes" in clusters.columns:
            display_cols.append("whale_strikes")

        print(clusters[display_cols].head(20).to_string(index=False))

    return clusters


# ---------------------------------------------------------------------
# PHASE 2: Flow Sentiment + Smart Hedge Filter
# ---------------------------------------------------------------------

def analyze_flow_and_hedge_filter(clusters_df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze flow sentiment and filter out hedge activity.

    For each ticker in clusters:
    1. Get aggregated flow data (call vs put premium)
    2. Get price trend (current price vs SMA20)
    3. Apply hedge filter logic:
       - Bullish flow + down trend = REJECT (likely short hedge)
       - Bearish flow + up trend = REJECT (likely long hedge)
       - Aligned flow + trend = ACCEPT

    Args:
        clusters_df: DataFrame of whale clusters from Phase 1B

    Returns:
        DataFrame with only valid signals (hedges filtered out)
    """
    print("\n" + "=" * 80)
    print("PHASE 2: Flow Sentiment + Smart Hedge Filter")
    print("=" * 80)

    if clusters_df is None or clusters_df.empty:
        print("\n❌ No clusters to analyze.")
        return pd.DataFrame()

    # Get unique tickers from clusters
    if "ticker" not in clusters_df.columns:
        print("\n❌ No ticker column in clusters.")
        return pd.DataFrame()

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    unique_tickers = clusters_df["ticker"].unique().tolist()
    print(f"\nAnalyzing {len(unique_tickers)} unique tickers...")

    # Step 1: Fetch price data for all tickers at once
    print("\n📊 Fetching price data and technicals...")
    print(f"   Requesting data for {len(unique_tickers)} tickers: {unique_tickers[:10]}...")
    try:
        aggs_data_raw = xynth_client.list_aggs(
            ticker=unique_tickers,
            timespan="day",
            multiplier=1,
            indicator_categories=["TREND", "VOLATILITY"],
        )
        # Normalize to dict[ticker] -> {"price_data": DataFrame, ...}
        aggs_data: Dict[str, Dict[str, Any]] = {}
        if isinstance(aggs_data_raw, dict):
            aggs_data = aggs_data_raw
        elif isinstance(aggs_data_raw, pd.DataFrame):
            for t, g in aggs_data_raw.groupby("ticker"):
                aggs_data[t] = {"price_data": g}
        else:
            print("   ⚠️ Unexpected aggs_data type, using empty dict")
            aggs_data = {}

        print(f"   ✅ Received data for {len(aggs_data)} tickers")
        if aggs_data:
            print(f"   Sample tickers in response: {list(aggs_data.keys())[:5]}")
    except Exception as e:
        print(f"\n❌ Error fetching price data: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

    # Step 2: Analyze each ticker
    valid_signals: List[Dict[str, Any]] = []
    rejected_count = 0
    skipped_count = 0

    for ticker in unique_tickers:
        try:
            print(f"\n   🔍 Processing ticker: {ticker}")
            # Get flow sentiment
            flow = xynth_client.get_flow_per_expiry(ticker)
            flow = _ensure_df(flow)
            print(f"      Flow data received: {len(flow)} rows")

            if flow.empty:
                skipped_count += 1
                continue

            # Sum call vs put premium
            total_call_prem = flow["call_premium"].sum() if "call_premium" in flow.columns else 0
            total_put_prem = flow["put_premium"].sum() if "put_premium" in flow.columns else 0

            # Avoid division by zero
            if total_put_prem == 0:
                total_put_prem = 1
            if total_call_prem == 0:
                total_call_prem = 1

            # Determine flow sentiment (2:1 ratio rule)
            flow_sentiment = "NEUTRAL"
            if total_call_prem > total_put_prem * 2:
                flow_sentiment = "BULLISH"
            elif total_put_prem > total_call_prem * 2:
                flow_sentiment = "BEARISH"

            if flow_sentiment == "NEUTRAL":
                skipped_count += 1
                continue

            # Get price trend
            print(f"      Looking up {ticker} in aggs_data...")
            ticker_data = aggs_data.get(ticker)
            if not ticker_data:
                print(f"      ⚠️ No price data for {ticker} in aggs response")
                skipped_count += 1
                continue
            print(f"      ✅ Found price data for {ticker}")

            price_df = _ensure_df(ticker_data.get("price_data"))
            if price_df is None or price_df.empty:
                skipped_count += 1
                continue

            last_close = price_df["close"].iloc[-1]
            sma_20 = (
                price_df["SMA_20"].iloc[-1]
                if "SMA_20" in price_df.columns
                else float(last_close)
            )

            # Define trend
            price_trend = (
                "UP"
                if last_close > sma_20 * 1.02
                else "DOWN"
                if last_close < sma_20 * 0.98
                else "FLAT"
            )

            # Apply hedge filter
            is_hedge = False
            signal_type = "UNKNOWN"
            confidence = "LOW"

            if flow_sentiment == "BULLISH":
                if price_trend == "DOWN":
                    is_hedge = True  # Short covering / hedge
                    rejected_count += 1
                elif price_trend == "UP":
                    signal_type = "TREND_FOLLOWING_LONG"
                    confidence = "MEDIUM"
                else:  # FLAT
                    signal_type = "BREAKOUT_LONG"
                    confidence = "HIGH"

            elif flow_sentiment == "BEARISH":
                if price_trend == "UP":
                    is_hedge = True  # Long protection
                    rejected_count += 1
                elif price_trend == "DOWN":
                    signal_type = "TREND_FOLLOWING_SHORT"
                    confidence = "MEDIUM"
                else:  # FLAT
                    signal_type = "BREAKDOWN_SHORT"
                    confidence = "HIGH"

            if not is_hedge:
                # Get all clusters for this ticker
                ticker_clusters = clusters_df[clusters_df["ticker"] == ticker]

                for _, cluster in ticker_clusters.iterrows():
                    valid_signals.append(
                        {
                            "ticker": ticker,
                            "direction": cluster.get("direction", "UNKNOWN"),
                            "expiry": cluster.get("expiry", "N/A"),
                            "total_premium": cluster.get("total_premium", 0),
                            "whale_strikes": cluster.get("whale_strikes", []),
                            "signal_type": signal_type,
                            "confidence": confidence,
                            "price": last_close,
                            "sma_20": sma_20,
                            "price_trend": price_trend,
                            "flow_sentiment": flow_sentiment,
                            "call_premium": total_call_prem,
                            "put_premium": total_put_prem,
                        }
                    )

        except Exception as e:
            print(f"  ⚠️  Error analyzing {ticker}: {e}")
            skipped_count += 1
            continue

    print(f"\n✅ Analysis complete:")
    print(f"   Valid signals: {len(valid_signals)}")
    print(f"   Rejected (hedges): {rejected_count}")
    print(f"   Skipped (no data/neutral): {skipped_count}")

    if not valid_signals:
        print("\n❌ No valid signals found after hedge filtering.")
        return pd.DataFrame()

    # Convert to DataFrame
    signals_df = pd.DataFrame(valid_signals)

    # Sort by confidence and premium
    confidence_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    signals_df["conf_rank"] = signals_df["confidence"].map(confidence_map)
    signals_df = signals_df.sort_values(
        ["conf_rank", "total_premium"], ascending=[False, False]
    )
    signals_df = signals_df.drop(columns=["conf_rank"])

    # Display top signals
    print("\nTop 20 valid signals:")
    display_cols = [
        "ticker",
        "signal_type",
        "confidence",
        "price",
        "flow_sentiment",
        "total_premium",
    ]
    print(signals_df[display_cols].head(20).to_string(index=False))

    return signals_df


# ---------------------------------------------------------------------
# PHASE 3: IV Filter & ATM Strike Selection
# ---------------------------------------------------------------------

def filter_iv_and_select_strikes(
    signals_df: pd.DataFrame, iv_percentile_threshold: float = 70.0
) -> pd.DataFrame:
    """
    Filter out overbought options using IV percentile and select ATM strikes
    with breathing room.

    For each signal:
    1. Fetch options chain (Greeks, IV)
    2. Check IV percentile - reject if IV > threshold (e.g., 70th percentile)
    3. Find ATM strikes closer to spot price than whale strikes (breathing room)
    4. Return trade candidates with selected strikes

    Args:
        signals_df: DataFrame of valid signals from Phase 2
        iv_percentile_threshold: Reject if IV percentile > this value (default 70)

    Returns:
        DataFrame with trade candidates including ATM strikes
    """
    print("\n" + "=" * 80)
    print("PHASE 3: IV Filter + ATM Strike Selection")
    print("=" * 80)

    if signals_df is None or signals_df.empty:
        print("\n❌ No signals to analyze.")
        return pd.DataFrame()

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    print(f"\nAnalyzing {len(signals_df)} signals...")
    print(f"IV percentile threshold: {iv_percentile_threshold}%")

    trade_candidates: List[Dict[str, Any]] = []
    rejected_iv = 0
    skipped_no_data = 0

    # 1. Prepare all requests
    print(f"\n🔄 Building batch request for {len(signals_df)} signals...")
    all_requests: List[Dict[str, Any]] = []
    request_keys: List[str] = []

    for _, signal in signals_df.iterrows():
        ticker = signal["ticker"]
        expiry = signal["expiry"]
        price = signal["price"]

        price_buffer = price * 0.15
        key = f"{ticker}_{expiry}"
        request_keys.append(key)
        all_requests.append(
            {
                "stock_ticker": ticker,
                "strike_date": expiry,
                "num_strikes": price_buffer,
            }
        )

    # 2. Fetch all chains in parallel
    chains_data: Dict[str, pd.DataFrame] = {}
    if all_requests:
        try:
            raw = xynth_client.fetch_raw_options_15_min_delayed(all_requests)
            # Expecting raw to be mapping from key to chain; if it's a list, map by index
            if isinstance(raw, dict):
                for k, v in raw.items():
                    chains_data[k] = _ensure_df(v)
            elif isinstance(raw, list):
                for k, v in zip(request_keys, raw):
                    chains_data[k] = _ensure_df(v)
        except Exception as e:
            print(f"❌ Batch fetch failed: {e}")
            return pd.DataFrame()

    # 3. Process results
    for _, signal in signals_df.iterrows():
        try:
            ticker = signal["ticker"]
            expiry = signal["expiry"]
            direction = signal["direction"]
            price = signal["price"]
            whale_strikes = signal.get("whale_strikes", [])

            print(f"\n🔍 Processing {ticker} {expiry} ({direction})")

            chain_key = f"{ticker}_{expiry}"

            if chain_key not in chains_data:
                print(f"  ⚠️  Key {chain_key} not found in batch results")
                skipped_no_data += 1
                continue

            full_chain_df = chains_data[chain_key]
            if full_chain_df.empty:
                print("  ⚠️  Chain DataFrame is empty")
                skipped_no_data += 1
                continue

            # Filter for the specific expiry we want
            if "details.expiration_date" in full_chain_df.columns:
                full_chain_df = full_chain_df[
                    full_chain_df["details.expiration_date"] == expiry
                ]
                if full_chain_df.empty:
                    print(f"  ⚠️  No data for expiry {expiry}")
                    skipped_no_data += 1
                    continue

            # Normalize column names
            c_type_col = (
                "details.contract_type"
                if "details.contract_type" in full_chain_df.columns
                else "contract_type"
            )
            strike_col = (
                "details.strike_price"
                if "details.strike_price" in full_chain_df.columns
                else "strike_price"
            )
            iv_col = "implied_volatility"
            delta_col = "greeks.delta"
            ask_col = "last_quote.ask"
            bid_col = "last_quote.bid"

            if c_type_col not in full_chain_df.columns:
                print("  ⚠️  Contract type column missing")
                skipped_no_data += 1
                continue

            # Split into calls and puts
            calls_df = full_chain_df[full_chain_df[c_type_col] == "call"].copy()
            puts_df = full_chain_df[full_chain_df[c_type_col] == "put"].copy()

            if calls_df.empty and puts_df.empty:
                print("  ⚠️  No calls or puts found")
                skipped_no_data += 1
                continue

            # Determine which side to analyze based on direction
            if direction == "CALL":
                options_df = calls_df
                option_type = "call"
            else:
                options_df = puts_df
                option_type = "put"

            if options_df.empty:
                print(f"  ⚠️  No {direction}s found")
                skipped_no_data += 1
                continue

            # Calculate IV percentile (relative within this chain)
            if iv_col not in options_df.columns or options_df[iv_col].isna().all():
                print("  ⚠️  IV column missing or all NaN")
                skipped_no_data += 1
                continue

            current_iv_series = options_df[iv_col].dropna()
            if current_iv_series.empty:
                skipped_no_data += 1
                continue

            current_iv = current_iv_series.mean()
            iv_52w_high = current_iv_series.max() * 1.2
            iv_52w_low = current_iv_series.min() * 0.8

            if iv_52w_high == iv_52w_low:
                iv_percentile = 50.0
            else:
                iv_percentile = (
                    (current_iv - iv_52w_low) / (iv_52w_high - iv_52w_low) * 100
                )

            print(f"   IV: {current_iv:.4f} (Percentile: {iv_percentile:.1f}%)")

            # Reject if IV is too high (overbought)
            if iv_percentile > iv_percentile_threshold:
                print(f"  ❌ Rejected: High IV ({iv_percentile:.1f}%)")
                rejected_iv += 1
                continue

            # Find ATM strikes with breathing room
            if strike_col not in options_df.columns:
                print("  ⚠️  Strike column missing")
                skipped_no_data += 1
                continue

            options_df["strike"] = options_df[strike_col].astype(float)
            options_df["distance_from_spot"] = (options_df["strike"] - price).abs()
            options_df = options_df.sort_values("distance_from_spot")

            # Get whale strike range + average
            if isinstance(whale_strikes, list) and len(whale_strikes) > 0:
                whale_strikes_float = [float(s) for s in whale_strikes]
                whale_min = min(whale_strikes_float)
                whale_max = max(whale_strikes_float)
                whale_avg = sum(whale_strikes_float) / len(whale_strikes_float)
            else:
                whale_min = whale_max = whale_avg = float(price)

            # Select ATM strike closer to spot than whale strikes
            atm_candidates = options_df.head(5)
            selected_strike = None
            selected_delta = None
            selected_premium = None

            print("   Checking ATM candidates for breathing room:")
            for _, opt in atm_candidates.iterrows():
                strike = float(opt["strike"])
                dist = float(opt["distance_from_spot"])
                print(f"    - Strike {strike} (Dist: {dist:.2f})")

                if option_type == "call":
                    if strike <= whale_min:
                        print(f"      ✅ Selected: {strike} <= Whale Min {whale_min}")
                        selected_strike = strike
                        selected_delta = opt.get(delta_col, None)
                        selected_premium = opt.get(
                            ask_col, opt.get(bid_col, None)
                        )
                        break
                    else:
                        print(f"      ❌ Skip: {strike} > Whale Min {whale_min}")
                else:
                    # puts
                    if strike >= whale_max:
                        print(f"      ✅ Selected: {strike} >= Whale Max {whale_max}")
                        selected_strike = strike
                        selected_delta = opt.get(delta_col, None)
                        selected_premium = opt.get(
                            ask_col, opt.get(bid_col, None)
                        )
                        break
                    else:
                        print(f"      ❌ Skip: {strike} < Whale Max {whale_max}")

            # If no breathing room found, use closest ATM
            if selected_strike is None:
                print("   ⚠️ No ideal strike found, picking closest ATM")
                closest = atm_candidates.iloc[0]
                selected_strike = float(closest["strike"])
                selected_delta = closest.get(delta_col, None)
                selected_premium = closest.get(ask_col, closest.get(bid_col, None))

            # Build trade candidate
            candidate = {
                "ticker": ticker,
                "signal_type": signal["signal_type"],
                "confidence": signal["confidence"],
                "price": price,
                "expiry": expiry,
                "option_type": option_type,
                "selected_strike": selected_strike,
                "delta": selected_delta,
                "premium": selected_premium,
                "iv_percentile": round(iv_percentile, 1),
                "current_iv": round(current_iv * 100, 1),
                "whale_strikes": whale_strikes,
                "whale_avg_strike": round(whale_avg, 2),
                "total_whale_premium": signal["total_premium"],
                "flow_sentiment": signal["flow_sentiment"],
            }
            print(
                f"   ✅ Candidate added: {ticker} {expiry} {selected_strike} {option_type}"
            )
            trade_candidates.append(candidate)

        except Exception as e:
            print(f"  ⚠️  Error processing {signal.get('ticker', 'UNKNOWN')}: {e}")
            skipped_no_data += 1
            continue

    print(f"\n✅ Analysis complete:")
    print(f"   Trade candidates: {len(trade_candidates)}")
    print(f"   Rejected (high IV): {rejected_iv}")
    print(f"   Skipped (no data): {skipped_no_data}")

    if not trade_candidates:
        print("\n❌ No trade candidates found after IV filtering.")
        return pd.DataFrame()

    candidates_df = pd.DataFrame(trade_candidates)

    # Sort by confidence and IV percentile (prefer lower IV)
    confidence_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    candidates_df["conf_rank"] = candidates_df["confidence"].map(confidence_map)
    candidates_df = candidates_df.sort_values(
        ["conf_rank", "iv_percentile"], ascending=[False, True]
    )
    candidates_df = candidates_df.drop(columns=["conf_rank"])

    # Display top candidates
    print("\nTop 15 trade candidates:")
    display_cols = [
        "ticker",
        "signal_type",
        "confidence",
        "selected_strike",
        "delta",
        "iv_percentile",
        "premium",
    ]
    print(candidates_df[display_cols].head(15).to_string(index=False))

    return candidates_df


# ---------------------------------------------------------------------
# PHASE 4: Narrative Validation & Risk Check
# ---------------------------------------------------------------------

def analyze_ticker_narrative(ticker: str) -> Dict:
    """
    Atomic Task: Search + LLM Decision.
    1. Searches for news/catalysts for the ticker.
    2. Uses LLM to structure the findings into risks and narrative.
    """
    if xynth_unified_search_client is None:
        raise RuntimeError("xynth_unified_search_client is not initialized")

    # 1. Search
    query = f"{ticker} stock news catalysts earnings mergers"
    try:
        search_result = xynth_unified_search_client.search(
            query=query,
            prompt_type="financial",
            news_no=5,  # Keep light for speed
            twitter_no=0,  # Skip social for core narrative
            reddit_no=0,
        )
        analysis_text = search_result.get("analysis", "")
    except Exception as e:
        return {
            "ticker": ticker,
            "status": "failed",
            "error": f"Search failed: {str(e)}",
        }

    # 2. LLM Decision
    context = f"""
    TICKER: {ticker}
    SEARCH ANALYSIS:
    {analysis_text}
    """

    instruction = """
    Analyze the search results for this stock. 
    Determine if there is a specific BINARY EVENT (Earnings, FDA decision, Lawsuit verdict) in the next 7 days.
    Identify the primary narrative driver (Catalyst, Macro, Silent Accumulation).
    Assess sentiment (-1.0 to 1.0).
    """

    response_schema = {
        "type": "object",
        "properties": {
            "binary_event_warning": {
                "type": "boolean",
                "description": "True if earnings/FDA/binary event in < 7 days",
            },
            "event_description": {
                "type": "string",
                "description": "Description of the event if True, else 'None'",
            },
            "primary_narrative": {
                "type": "string",
                "enum": [
                    "EARNINGS_PLAY",
                    "CATALYST_DRIVEN",
                    "MACRO_SECTOR",
                    "SILENT_ACCUMULATION",
                    "BAD_NEWS_DUMP",
                    "UNKNOWN",
                ],
            },
            "sentiment_score": {
                "type": "number",
                "description": "Float between -1.0 (Bearish) and 1.0 (Bullish)",
            },
            "summary": {
                "type": "string",
                "description": "One sentence summary of the news context",
            },
        },
        "required": [
            "binary_event_warning",
            "primary_narrative",
            "sentiment_score",
            "summary",
        ],
    }

    try:
        decision = xynth_client.structured_llm_call(
            context=context,
            instruction=instruction,
            response_schema=response_schema,
        )
        # Flatten result
        return {
            "ticker": ticker,
            "status": "success",
            **decision,
        }
    except Exception as e:
        return {
            "ticker": ticker,
            "status": "failed",
            "error": f"LLM failed: {str(e)}",
        }


def enrich_candidates_with_narrative(candidates_df: pd.DataFrame) -> pd.DataFrame:
    """
    Phase 4: Parallel Batch Analysis of Narratives.
    """
    print("\n" + "=" * 80)
    print("PHASE 4: Unified Search & Narrative Validation")
    print("=" * 80)

    if candidates_df is None or candidates_df.empty:
        print("❌ No candidates to enrich.")
        return candidates_df

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    unique_tickers = candidates_df["ticker"].unique().tolist()
    print(f"🔎 Analyzing narratives for {len(unique_tickers)} tickers in PARALLEL batch...")

    # Prepare Tasks
    tasks = []
    for ticker in unique_tickers:
        tasks.append(
            (f"narrative_{ticker}", analyze_ticker_narrative, {"ticker": ticker})
        )

    # Execute Batch
    start_time = time.time()
    results = xynth_client.execute_batch(tasks)
    duration = time.time() - start_time
    print(f"✅ Batch analysis complete in {duration:.2f} seconds.")

    # Parse Results into a lookup dict
    narrative_map: Dict[str, Dict[str, Any]] = {}
    for task_id, res in results.items():
        tkr = task_id.replace("narrative_", "")
        if res.get("status") == "success":
            narrative_map[tkr] = res
        else:
            print(f"  ⚠️ Analysis failed for {tkr}: {res.get('error')}")
            narrative_map[tkr] = {
                "binary_event_warning": False,
                "primary_narrative": "UNKNOWN_ERROR",
                "sentiment_score": 0.0,
                "summary": "Analysis failed.",
            }

    # Helper to apply map safely
    def get_field(t: str, field: str):
        return narrative_map.get(t, {}).get(field, None)

    df = candidates_df.copy()
    df["binary_risk"] = df["ticker"].apply(
        lambda t: get_field(t, "binary_event_warning")
    )
    df["narrative_type"] = df["ticker"].apply(
        lambda t: get_field(t, "primary_narrative")
    )
    df["news_sentiment"] = df["ticker"].apply(
        lambda t: get_field(t, "sentiment_score")
    )
    df["news_summary"] = df["ticker"].apply(lambda t: get_field(t, "summary"))

    # Display Enrichment
    cols = ["ticker", "binary_risk", "narrative_type", "news_sentiment", "news_summary"]
    print("\nEnriched Narrative Data:")
    print(df[cols].head(15).to_string(index=False))

    return df


# ---------------------------------------------------------------------
# PHASE 5: Smart Strike Optimization (Breathing Room Protocol)
# ---------------------------------------------------------------------

def optimize_strike_zones(
    candidates_df: pd.DataFrame,
) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """
    Phase 5: Select the "Golden Middle" strike & Build Strategy Payloads.
    1. Give breathing room on Expiry (Shift +14 days if possible).
    2. Give breathing room on Strike (Target ATM/JOTM instead of Whale's Deep OTM).

    Returns:
        Tuple(DataFrame for CSV, List[Strategies] for Calculator)
    """
    print("\n" + "=" * 80)
    print("PHASE 5: Smart Strike Optimization (Breathing Room Protocol)")
    print("=" * 80)

    if candidates_df is None or candidates_df.empty:
        print("❌ No candidates to optimize.")
        return candidates_df, []

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    print(f"🎯 Optimizing strikes for {len(candidates_df)} candidates (PARALLEL BATCH)...")

    # 1. Prepare Batch Tasks (Fetch Original AND Shifted Expiry)
    tasks = []
    # Map (ticker, orig_expiry) -> shifted_expiry
    shifted_expiries: Dict[Tuple[str, str], str] = {}

    for _, row in candidates_df.iterrows():
        ticker = row["ticker"]
        expiry = row["expiry"]

        try:
            curr_date = datetime.strptime(expiry, "%Y-%m-%d")
            target_date = curr_date + timedelta(days=14)

            # Move to nearest Friday
            while target_date.weekday() != 4:
                target_date += timedelta(days=1)

            shifted_str = target_date.strftime("%Y-%m-%d")
            shifted_expiries[(ticker, expiry)] = shifted_str

            tasks.append(
                (
                    f"chain_{ticker}_{expiry}_orig",
                    xynth_client.get_option_contracts,
                    {"ticker": ticker, "expiry": expiry},
                )
            )
            tasks.append(
                (
                    f"chain_{ticker}_{expiry}_shift",
                    xynth_client.get_option_contracts,
                    {"ticker": ticker, "expiry": shifted_str},
                )
            )
        except Exception as e:
            print(f"  ⚠️ Date parsing error for {ticker}: {e}")
            shifted_expiries[(ticker, expiry)] = expiry
            tasks.append(
                (
                    f"chain_{ticker}_{expiry}_orig",
                    xynth_client.get_option_contracts,
                    {"ticker": ticker, "expiry": expiry},
                )
            )

    # 2. Execute Batch
    start_time = time.time()
    results = xynth_client.execute_batch(tasks)
    duration = time.time() - start_time
    print(f"✅ Chain fetch complete in {duration:.2f} seconds.")

    # 3. Process Results
    optimized_list: List[pd.Series] = []
    strategies_payload: List[Dict[str, Any]] = []

    for _, row in candidates_df.iterrows():
        ticker = row["ticker"]
        option_type = row["option_type"]
        spot = float(row["price"])
        whale_avg = float(row["whale_avg_strike"])
        orig_expiry = row["expiry"]
        shifted_expiry = shifted_expiries.get((ticker, orig_expiry), orig_expiry)

        orig_key = f"chain_{ticker}_{orig_expiry}_orig"
        shift_key = f"chain_{ticker}_{orig_expiry}_shift"

        active_chain = results.get(orig_key)
        active_expiry = orig_expiry
        expiry_note = "Original (Short Term)"

        shifted_chain = results.get(shift_key)
        shifted_df = _ensure_df(shifted_chain)
        if not shifted_df.empty:
            active_chain = shifted_df
            active_expiry = shifted_expiry
            expiry_note = "Shifted (+14d Breathing Room)"

        chain_df = _ensure_df(active_chain)
        if chain_df.empty:
            print(f"  ⚠️ No chain found for {ticker}")
            row = row.copy()
            row["optimized_strike"] = row["selected_strike"]
            row["optimized_expiry"] = row["expiry"]
            row["structure_suggestion"] = "Standard Long (No Chain)"
            optimized_list.append(row)
            continue

        try:
            # Filter by Option Type
            type_col = next(
                (c for c in chain_df.columns if c in ["contract_type", "type"]), None
            )
            if not type_col:
                raise ValueError("Missing contract_type column")

            chain_df[type_col] = chain_df[type_col].astype(str).str.lower()
            chain_df = chain_df[chain_df[type_col].str.startswith(option_type[0])]
            if chain_df.empty:
                print(f"  ⚠️ No {option_type}s in chain for {ticker}")
                continue

            # SMART STRIKE LOGIC (ATM/JOTM Focus)
            if option_type == "call":
                ideal_strike = spot * 1.02
                if whale_avg > spot and ideal_strike > whale_avg:
                    ideal_strike = (spot + whale_avg) / 2.0
            else:
                ideal_strike = spot * 0.98
                if whale_avg < spot and ideal_strike < whale_avg:
                    ideal_strike = (spot + whale_avg) / 2.0

            strike_col = next(
                (c for c in chain_df.columns if c in ["strike_price", "strike"]), None
            )
            if not strike_col:
                raise ValueError("Missing strike column")

            chain_df[strike_col] = chain_df[strike_col].astype(float)
            chain_df["strike_dist"] = (chain_df[strike_col] - ideal_strike).abs()
            best_contract = chain_df.sort_values("strike_dist").iloc[0]
            new_strike = float(best_contract[strike_col])

            row = row.copy()
            row["optimized_strike"] = new_strike
            row["optimized_expiry"] = active_expiry

            # STRATEGY BUILDING LOGIC
            legs: List[Dict[str, Any]] = []
            structure_name: str

            def extract_leg_data(contract_row: pd.Series, action: str = "buy") -> Dict:
                return {
                    "strike": float(contract_row[strike_col]),
                    "expiration": active_expiry,
                    "type": option_type,
                    "action": action,
                    "premium": float(
                        contract_row.get(
                            "last_price", contract_row.get("avg_price", 0.0)
                        )
                    ),
                    "delta": float(
                        contract_row.get("greeks.delta", 0.0)
                    ),
                    "implied_volatility": float(
                        contract_row.get("implied_volatility", 0.0)
                    ),
                }

            spread_threshold = spot * 0.05  # 5% distance required for spread

            if option_type == "call" and (whale_avg - new_strike) > spread_threshold:
                structure_name = f"Call Spread {new_strike}/{whale_avg}"
                legs.append(extract_leg_data(best_contract, "buy"))

                chain_df["whale_dist"] = (chain_df[strike_col] - whale_avg).abs()
                sell_contract = chain_df.sort_values("whale_dist").iloc[0]
                legs.append(extract_leg_data(sell_contract, "sell"))

            elif option_type == "put" and (new_strike - whale_avg) > spread_threshold:
                structure_name = f"Put Spread {new_strike}/{whale_avg}"
                legs.append(extract_leg_data(best_contract, "buy"))
                chain_df["whale_dist"] = (chain_df[strike_col] - whale_avg).abs()
                sell_contract = chain_df.sort_values("whale_dist").iloc[0]
                legs.append(extract_leg_data(sell_contract, "sell"))

            else:
                structure_name = f"Long {option_type.upper()} @ {new_strike}"
                legs.append(extract_leg_data(best_contract, "buy"))

            row["structure_suggestion"] = structure_name
            optimized_list.append(row)

            strategies_payload.append(
                {
                    "title": f"{ticker} {structure_name} ({expiry_note})",
                    "ticker": ticker,
                    "legs": legs,
                }
            )

        except Exception as e:
            print(f"  ⚠️ Optimization logic error for {ticker}: {e}")
            row = row.copy()
            row["optimized_strike"] = row["selected_strike"]
            row["optimized_expiry"] = row["expiry"]
            row["structure_suggestion"] = "Standard Long (Fallback)"
            optimized_list.append(row)

    optimized_df = pd.DataFrame(optimized_list)
    if "optimized_expiry" not in optimized_df.columns:
        optimized_df["optimized_expiry"] = optimized_df["expiry"]

    print("\nTop Optimized Structures:")
    cols = [
        "ticker",
        "price",
        "optimized_strike",
        "optimized_expiry",
        "structure_suggestion",
    ]
    print(optimized_df[cols].head(15).to_string(index=False))

    print(f"\n✅ Generated {len(strategies_payload)} executable strategy payloads.")
    return optimized_df, strategies_payload


# ---------------------------------------------------------------------
# PHASE 6: Build & Calculate P&L for Strategies
# ---------------------------------------------------------------------

def calculate_strategy_pnl(
    strategy_payloads: List[Dict[str, Any]],
) -> pd.DataFrame:
    """
    Phase 6: Build strategies and calculate P&L (No Visuals).
    Returns P&L DataFrame.
    """
    print("\n" + "=" * 80)
    print("PHASE 6: Build & Calculate P&L for Strategies")
    print("=" * 80)

    if not strategy_payloads:
        print("⚠️ No strategies to calculate.")
        return pd.DataFrame()

    if xynth_client is None:
        raise RuntimeError("xynth_client is not initialized")

    print(f"🚀 Sending {len(strategy_payloads)} strategies to Options Calculator (No Visuals)...")
    try:
        strategy_results = xynth_client.options_strategy_builder(
            strategy_payloads, visualize=False
        )

        flattened_results = []
        for res in strategy_results:
            flat = {
                "ticker": res.get("ticker"),
                "title": res.get("title"),
                "stock_price": res.get("stock_price"),
                "success": res.get("success"),
                "error": res.get("error"),
            }
            metrics = res.get("strategy_metrics", {})
            if metrics:
                flat.update(
                    {
                        "max_profit": metrics.get("max_profit"),
                        "max_loss": metrics.get("max_loss"),
                        "breakeven": metrics.get("breakeven"),
                        "rr_ratio": metrics.get("risk_reward_ratio"),
                    }
                )
            flattened_results.append(flat)

        pnl_df = pd.DataFrame(flattened_results)
        print(f"\n✅ P&L calculation complete for {len(pnl_df)} strategies.")
        return pnl_df

    except Exception as e:
        print(f"❌ Phase 6 execution failed: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()


# ---------------------------------------------------------------------
# ORCHESTRATOR
# ---------------------------------------------------------------------

def run_whale_pipeline(
    config: Dict[str, Any], iv_threshold: float = 70.0
) -> Dict[str, pd.DataFrame]:
    """
    Run the full whale options pipeline end-to-end.

    Returns a dict of intermediate DataFrames so you can inspect each phase.
    """
    alerts = fetch_whale_alerts(config)
    clusters = build_whale_clusters(alerts)
    signals = analyze_flow_and_hedge_filter(clusters)
    candidates = filter_iv_and_select_strikes(signals, iv_threshold)
    enriched = enrich_candidates_with_narrative(candidates)
    optimized_df, strategies_payload = optimize_strike_zones(enriched)
    pnl_df = calculate_strategy_pnl(strategies_payload)

    return {
        "alerts": alerts,
        "clusters": clusters,
        "signals": signals,
        "candidates": candidates,
        "enriched": enriched,
        "optimized": optimized_df,
        "pnl": pnl_df,
    }


if __name__ == "__main__":
    # Example placeholder config – adjust for production
    example_config = {
        "limit": 200,
        "min_premium": 50000,
        "max_dte": 90,
        "min_size": None,
        "ticker_symbol": None,
        "rule_names": None,
    }

    # Ensure you have initialized:
    #   xynth_client
    #   xynth_unified_search_client
    #
    # Then:
    # results = run_whale_pipeline(example_config, iv_threshold=70.0)
    pass
