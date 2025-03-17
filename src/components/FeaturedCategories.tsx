import React from 'react';

const categories = [
  {
    title: 'FISHING REELS',
    image: 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&q=80',
    description: 'Premium quality reels for every fishing style'
  },
  {
    title: 'LURES',
    image: 'https://images.unsplash.com/photo-1587552629704-c96270d05472?auto=format&fit=crop&q=80',
    description: 'Effective lures for any catch'
  },
  {
    title: 'FISHING ACCESSORIES',
    image: 'https://images.unsplash.com/photo-1587552613346-a0fb2f5c2835?auto=format&fit=crop&q=80',
    description: 'Essential gear for successful trips'
  },
  {
    title: 'ROD & REEL COMBOS',
    image: 'https://images.unsplash.com/photo-1595274459742-4a41d35784ee?auto=format&fit=crop&q=80',
    description: 'Perfect combinations for beginners and pros'
  },
  {
    title: 'RODS',
    image: 'https://images.unsplash.com/photo-1516962080544-eac695c93791?auto=format&fit=crop&q=80',
    description: 'High-performance fishing rods'
  },
  {
    title: 'ICE FISHING',
    image: 'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3?auto=format&fit=crop&q=80',
    description: 'Specialized gear for ice fishing'
  },
  {
    title: 'KAYAKS & CANOES',
    image: 'https://images.unsplash.com/photo-1472745433479-4556f22e32c2?auto=format&fit=crop&q=80',
    description: 'Explore the waters your way'
  },
  {
    title: 'FISHING LINE, HOOKS, & WEIGHTS',
    image: 'https://images.unsplash.com/photo-1587552613346-a0fb2f5c2835?auto=format&fit=crop&q=80',
    description: 'Essential fishing components'
  }
];

const FeaturedCategories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <a
              href="#"
              key={category.title}
              className="relative overflow-hidden group cursor-pointer block"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white tracking-wider">
                    {category.title}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;