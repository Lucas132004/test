import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SpotlightSection from './components/SpotlightSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';
import ProductsPage from './components/ProductsPage';
import TrackOrderPage from './components/TrackOrderPage';
import ContactPage from './components/info/ContactPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-forest-100">
        <NavBar />
        
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <div className="relative h-[600px]">
                <img 
                  src="https://www.stonechevybuickgmc.com/blogs/3618/wp-content/uploads/2021/03/7_Best_Fishing_Spots_Near_Tulare_637509770738788697.png"
                  alt="Fishing spot"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="relative h-full flex items-center justify-center text-center">
                  <div className="max-w-4xl px-4">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                      Your Adventure Starts Here
                    </h1>
                    <p className="text-xl text-white/90 mb-8 drop-shadow font-light">
                      Premium fishing gear and outdoor equipment for the passionate adventurer
                    </p>
                    <button className="bg-forest-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-forest-700 transition duration-300 shadow-lg">
                      Discover Our Gear
                    </button>
                  </div>
                </div>
              </div>

              <SpotlightSection />
              <TestimonialsSection />
            </>
          } />
          <Route path="/products/:category" element={<ProductsPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ContactPage />} />
          <Route path="/about" element={<ContactPage />} />
          <Route path="/faq" element={<ContactPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;