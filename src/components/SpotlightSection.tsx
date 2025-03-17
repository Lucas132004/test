import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

const spotlightItems = [
  {
    title: 'Best Sellers',
    description: 'Our most popular fishing gear loved by anglers worldwide',
    image: 'https://images.unsplash.com/photo-1541742425281-c1d3fc8aff96?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    reviews: 1250,
    price: 129.99,
    originalPrice: 159.99
  }
];

const SpotlightSection = () => {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 relative">
        <h2 className="text-3xl font-bold text-center mb-4 text-forest-700">Featured Collection</h2>
        <p className="text-center text-forest-600/80 mb-12 max-w-2xl mx-auto">
          Discover our handpicked selection of premium fishing gear, trusted by professional anglers worldwide
        </p>
        
        <div className="relative">
          <div className="overflow-hidden rounded-xl shadow-2xl">
            <div className="w-full">
              <div className="relative h-[500px]">
                <img
                  src={spotlightItems[0].image}
                  alt={spotlightItems[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
                  <div className="text-left max-w-2xl px-8 sm:px-12">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-white/90">({spotlightItems[0].reviews})</span>
                    </div>
                    
                    <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4">{spotlightItems[0].title}</h3>
                    <p className="text-white/90 text-lg mb-6">{spotlightItems[0].description}</p>
                    
                    <div className="flex items-baseline mb-8">
                      <span className="text-3xl font-bold text-white">${spotlightItems[0].price}</span>
                      <span className="ml-3 text-xl text-white/70 line-through">${spotlightItems[0].originalPrice}</span>
                      <span className="ml-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm">Save ${(spotlightItems[0].originalPrice - spotlightItems[0].price).toFixed(2)}</span>
                    </div>
                    
                    <button className="group bg-white text-forest-700 px-8 py-3 rounded-lg font-semibold hover:bg-forest-50 transition duration-300 flex items-center">
                      Shop Now
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotlightSection;