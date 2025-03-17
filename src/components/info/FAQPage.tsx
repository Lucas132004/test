import React from 'react';
import { HelpCircle } from 'lucide-react';

const FAQPage = () => {
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
  );
};

export default FAQPage;