import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<null | {
    status: string;
    location: string;
    date: string;
  }>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated tracking info
    setTrackingStatus({
      status: 'In Transit',
      location: 'Chicago Distribution Center',
      date: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="min-h-screen bg-forest-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-forest-700 mb-6">Track Your Order</h1>
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-forest-600 mb-2">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-forest-100 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  placeholder="Enter your order number"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-forest-600 text-white p-2 rounded-lg hover:bg-forest-700 transition"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {trackingStatus && (
              <div className="mt-8 p-6 bg-forest-50 rounded-lg">
                <h2 className="text-xl font-semibold text-forest-700 mb-4">Tracking Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-forest-600 font-medium">Status:</span>
                    <span className="ml-2 text-forest-700">{trackingStatus.status}</span>
                  </div>
                  <div>
                    <span className="text-forest-600 font-medium">Location:</span>
                    <span className="ml-2 text-forest-700">{trackingStatus.location}</span>
                  </div>
                  <div>
                    <span className="text-forest-600 font-medium">Last Updated:</span>
                    <span className="ml-2 text-forest-700">{trackingStatus.date}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;