import { GraphQLClient } from 'graphql-request';

// Check if environment variables are set
if (!import.meta.env.VITE_SHOPIFY_STORE_URL || !import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN) {
  throw new Error('Shopify configuration is missing. Please set VITE_SHOPIFY_STORE_URL and VITE_SHOPIFY_ACCESS_TOKEN in your .env file');
}

const endpoint = import.meta.env.VITE_SHOPIFY_STORE_URL;
const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': accessToken,
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (collectionHandle: string) => {
  const query = `
    query GetProducts($handle: String!) {
      collection(handle: $handle) {
        products(first: 24) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyClient.request(query, { handle: collectionHandle });
    return data.collection.products.edges.map((edge: any) => edge.node);
  } catch (error) {
    console.error('Error fetching products:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    return [];
  }
};

export const addToCart = async (variantId: string) => {
  const mutation = `
    mutation CreateCart($variantId: ID!) {
      cartCreate(
        input: {
          lines: [{ quantity: 1, merchandiseId: $variantId }]
        }
      ) {
        cart {
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyClient.request(mutation, { variantId });
    
    if (data.cartCreate.userErrors.length > 0) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }
    
    return data.cartCreate.cart.checkoutUrl;
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
    throw error;
  }
};

export const getProduct = async (handle: string) => {
  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyClient.request(query, { handle });
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
    throw error;
  }
};