import React, { useState } from 'react';
import { Mail, Truck, Clock, HelpCircle } from 'lucide-react';

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('contact');

  const faqs = [
    {
      q: 'How can I contact Vanity Creek?',
      a: 'You can email us at vanitycreekshop@gmail.com, where our customer service team is happy to assist you with any inquiries.'
    },
    {
      q: 'Do you ship worldwide?',
      a: 'Yes, we ship worldwide.'
    },
    {
      q: 'Where do you ship from?',
      a: 'We ship from Hong Kong.'
    },
    {
      q: 'Can I change or cancel my order?',
      a: 'As we aim to process orders as quickly as possible, any changes or cancellations must be requested within 12 hours of placing your order. Requests made after this time cannot be accommodated. However, you may return your order for a full refund once it is received.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (VISA, Mastercard, AMEX) and PayPal payments.'
    },
    {
      q: 'When will my order be processed?',
      a: 'All orders are handled and shipped from our warehouse. Please allow extra time during holidays and sale seasons.\n\nProcessing time: 1-3 business days\nShipping occurs the day after processing\nPlease note, we do not ship on weekends.'
    },
    {
      q: 'How long will it take to receive my order?',
      a: 'Orders typically take between 2-4 weeks to arrive, depending on your location.'
    },
    {
      q: "What if I don't receive my order?",
      a: 'If you haven\'t received your order within 30 days after shipping, you are eligible for a full refund.'
    },
    {
      q: 'Will I be charged customs and taxes?',
      a: 'All prices displayed on our site are in Canadian Dollars (CAD) and are tax-free. However, you may be responsible for paying duties and taxes once your order arrives at its final destination. These fees are determined by your local customs office and are not covered by Vanity Creek. We are not responsible for delays caused by customs. For more information, please contact your local customs office.'
    }
  ];

  return (
    <div className="min-h-screen bg-forest-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['contact', 'shipping', 'about', 'faq'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-forest-600 text-white'
                  : 'bg-white text-forest-600 hover:bg-forest-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Contact Section */}
          <div className={`${activeTab === 'contact' ? 'block' : 'hidden'}`}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-6 w-6 text-forest-600" />
                <h2 className="text-2xl font-bold text-forest-700">Contact Us</h2>
              </div>
              <p className="text-forest-600 leading-relaxed mb-6">
                If you have any questions or need assistance, feel free to reach out to us at{' '}
                <a href="mailto:vanitycreekstore@gmail.com" className="text-forest-700 font-semibold hover:underline">
                  vanitycreekstore@gmail.com
                </a>
                . Our support team is here to help and will get back to you within 24 hours. We're dedicated to providing
                the best experience for our customers and look forward to assisting you.
              </p>
            </div>
          </div>

          {/* Shipping Section */}
          <div className={`${activeTab === 'shipping' ? 'block' : 'hidden'}`}>
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

          {/* About Section */}
          <div className={`${activeTab === 'about' ? 'block' : 'hidden'}`}>
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

          {/* FAQ Section */}
          <div className={`${activeTab === 'faq' ? 'block' : 'hidden'}`}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-forest-600" />
                <h2 className="text-2xl font-bold text-forest-700">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-forest-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-forest-700 mb-2">{faq.q}</h3>
                    <p className="text-forest-600 whitespace-pre-line">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;