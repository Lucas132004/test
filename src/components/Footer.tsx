import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="nature-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Fish className="h-8 w-8 text-sand-200" />
              <span className="text-xl logo-font tracking-wider">Vanity Creek</span>
            </div>
            <p className="text-sand-100/90 text-sm leading-relaxed">
              At Vanity Creek, we're passionate about connecting anglers with top-quality gear and apparel to elevate every fishing adventure. We strive to inspire a community of outdoor enthusiasts who live for the thrill of the catch and the beauty of the water.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sand-100">Stay Connected</h3>
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-forest-500/30 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-sand-300 placeholder-sand-200/50"
                />
                <button className="bg-sand-500 hover:bg-sand-600 px-4 py-2 rounded-r-lg transition whitespace-nowrap text-forest-900 font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sand-200/80 hover:text-sand-200 transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-sand-200/80 hover:text-sand-200 transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-sand-200/80 hover:text-sand-200 transition">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-sand-200/80 hover:text-sand-200 transition">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-sand-100">Quick Links</h3>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              <Link to="/about" className="text-sand-200/80 hover:text-sand-200 transition">About Us</Link>
              <Link to="/contact" className="text-sand-200/80 hover:text-sand-200 transition">Contact</Link>
              <Link to="/shipping" className="text-sand-200/80 hover:text-sand-200 transition">Shipping Policy</Link>
              <Link to="/faq" className="text-sand-200/80 hover:text-sand-200 transition">FAQs</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-forest-400/20 mt-12 pt-8 text-center text-sand-200/80 text-sm">
          <p>&copy; {new Date().getFullYear()} Vanity Creek. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;