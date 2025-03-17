import React, { useState } from 'react';
import { Search, Menu, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-forest-600 text-white py-2 text-center text-sm font-medium px-4">
        <div className="flex items-center justify-center space-x-2">
          <Truck className="h-4 w-4" />
          <span className="text-center">Free Shipping on Orders Over $50!</span>
        </div>
      </div>

      <nav className="sticky top-0 nature-gradient text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/premium-vector/man-fishing-lake-with-picture-forest-background_1175293-1365.jpg?w=360"
                  alt="Fishing Logo"
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))'
                  }}
                />
              </div>
              <span className="text-lg sm:text-2xl logo-font tracking-wider">Vanity Creek</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="hover:text-sand-200 transition-colors">
                Home
              </Link>
              <Link to="/fishing-rods" className="hover:text-sand-200 transition-colors">
                Fishing Rods
              </Link>
              <Link to="/reels" className="hover:text-sand-200 transition-colors">
                Reels
              </Link>
              <Link to="/lures-baits" className="hover:text-sand-200 transition-colors">
                Lures & Baits
              </Link>
              <Link to="/tackle-boxes" className="hover:text-sand-200 transition-colors">
                Tackle Boxes
              </Link>
              <Link to="/accessories" className="hover:text-sand-200 transition-colors">
                Accessories
              </Link>
              <Link to="/track-order" className="hover:text-sand-200 transition-colors">
                Track My Order
              </Link>
            </div>

            {/* Search and Mobile Menu Button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-2 hover:bg-forest-500/50 rounded-full transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button 
                className="lg:hidden p-2 hover:bg-forest-500/50 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2 bg-forest-700 rounded-b-lg border-t border-forest-600/50">
              <Link 
                to="/" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/fishing-rods" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fishing Rods
              </Link>
              <Link 
                to="/reels" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reels
              </Link>
              <Link 
                to="/lures-baits" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lures & Baits
              </Link>
              <Link 
                to="/tackle-boxes" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tackle Boxes
              </Link>
              <Link 
                to="/accessories" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link 
                to="/track-order" 
                className="block py-3 hover:bg-forest-600/50 px-4 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track My Order
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;