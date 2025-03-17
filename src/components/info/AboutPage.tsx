import React from 'react';
import { Clock } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-forest-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-forest-600" />
              <h2 className="text-2xl font-bold text-forest-700">About Us</h2>
            </div>
            <p className="text-forest-600 leading-relaxed">
              Vanity Creek is dedicated to serving the fishing community with premium gear and apparel designed to
              enhance your experience on the water. With a deep-rooted passion for fishing and the great outdoors,
              we strive to provide products that combine performance, durability, and style. Whether you're an avid
              angler or simply enjoy the serenity of nature, Vanity Creek is here to support your pursuit of the
              perfect catch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;