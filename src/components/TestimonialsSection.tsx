import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'John D.',
    image: 'https://images.unsplash.com/photo-1560809451-9c26b4effd35?auto=format&fit=crop&q=80',
    text: 'The quality of fishing gear from Vanity Creek is unmatched. My new rod and reel combo has completely transformed my fishing experience.',
    rating: 5
  },
  {
    name: 'Sarah M.',
    image: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&q=80',
    text: 'Excellent customer service and top-notch products. I particularly love their selection of fishing accessories.',
    rating: 5
  },
  {
    name: 'Mike R.',
    image: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&q=80',
    text: 'Been shopping here for all my outdoor needs. The quality and prices are great, and the staff really knows their stuff.',
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542372147193-a7aca54189cd?auto=format&fit=crop&q=80')] bg-cover bg-fixed opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 relative">
        <h2 className="text-3xl font-bold text-center mb-12 text-forest-700">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-forest-100">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;