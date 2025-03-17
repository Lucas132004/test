import React from 'react';
import { Truck } from 'lucide-react';

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-forest-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="h-6 w-6 text-forest-600" />
              <h2 className="text-2xl font-bold text-forest-700">Shipping Policy</h2>
            </div>
            <p className="text-forest-600 leading-relaxed">
              Due to high demand, orders may take 2-4 weeks to arrive. For any questions regarding your shipment,
              please email us at{' '}
              <a href="mailto:info@vanitycreek.com" className="text-forest-700 font-semibold hover:underline">
                info@vanitycreek.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;