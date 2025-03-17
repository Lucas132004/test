import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { getProducts, addToCart } from '../lib/shopify';

interface Product {
  id: string;
  title: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      if (category) {
        try {
          setLoading(true);
          setError(null);
          const fetchedProducts = await getProducts(category);
          setProducts(fetchedProducts);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = async (variantId: string) => {
    try {
      const checkoutUrl = await addToCart(variantId);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-forest-100 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-forest-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-forest-700 mb-4">Error</h2>
          <p className="text-forest-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-forest-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-forest-700 capitalize mb-4 sm:mb-0">
            {category?.replace('-', ' ')}
          </h1>
          
          <div className="flex items-center space-x-4">
            <select 
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-white border border-forest-200 rounded-lg px-4 py-2 text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-forest-600 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-xl shadow-lg overflow-hidden border border-forest-100 transform hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                  <div className="aspect-w-3 aspect-h-2">
                    <img
                      src={product.images.edges[0]?.node.url}
                      alt={product.images.edges[0]?.node.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-5 w-5 text-forest-600" />
                  </button>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-forest-700">{product.title}</h2>
                  <p className="text-forest-600/80 mb-4 text-sm">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-forest-600">
                        ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                      </span>
                      {parseFloat(product.priceRange.minVariantPrice.amount) >= 50 && (
                        <p className="text-sm text-green-600 font-medium mt-1">Free Shipping</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product.variants.edges[0].node.id)}
                      className="flex items-center bg-forest-600 text-white px-6 py-2 rounded-lg hover:bg-forest-700 transition duration-300"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;