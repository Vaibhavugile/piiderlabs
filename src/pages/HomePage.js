// src/pages/HomePage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 👇 IMPORT useCart and MOCK DATA
import { useCart } from '../context/CartContext';
import { MOCK_TESTS, TestCard } from '../data/TestListingData'; 
import './HomePage.css'; 

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  // 👇 Get cart state and functions
  const { totalItems, addItem } = useCart(); 
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const userName = currentUser ? currentUser.fullName || currentUser.email : '';
  
  const handleLogout = () => { 
    logout()
        .then(() => {
          navigate('/'); 
        })
        .catch(error => console.error("Logout error:", error));
  } 

   const handleDetailsClick = (testId) => {
          // Find the full test object to get its slug
          const testToView = MOCK_TESTS.find(t => t.id === testId);
          
          if (testToView && testToView.slug) {
              // Navigate to the dynamic route using the slug
              navigate(`/tests/${testToView.slug}`);
          } else {
              console.error(`Test with ID ${testId} not found or is missing a slug.`);
          }
      };

  const handleSearch = (e) => {
      e.preventDefault();
      // Temporarily navigate to /tests with search query
      navigate(`/tests?search=${searchQuery}`);
  };

  // 👇 ACTUAL CART ADD FUNCTION
  const handleAddToCart = (test) => {
      addItem(test);
  }
  
  // Show only highlighted tests on the homepage
  const featuredTests = MOCK_TESTS.filter(test => test.highlight).slice(0, 3);


  return (
    <div className="homepage-container">
      {/* --- HEADER/NAVBAR --- */}
      <header className="app-header">
        <div className="logo" onClick={() => navigate('/')}>
            🧪 **PiiderLab**
        </div>
        <nav className="header-nav">
          {currentUser ? (
            <>
              <span className="user-greeting">Hello, {userName.split(' ')[0]}</span>
              <button onClick={() => navigate('/dashboard')} className="header-button primary-button">
                My Dashboard
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="header-button secondary-button">
                Login
              </button>
              <button onClick={() => navigate('/signup')} className="header-button primary-button">
                Book a Test
              </button>
            </>
          )}
            {/* 👇 CART ICON BUTTON */}
            <button className="header-button cart-button" onClick={() => navigate('/cart')}>
                🛒 Cart ({totalItems})
            </button>
            
            {/* Logged in users get a logout button */}
            {currentUser && (
                <button onClick={handleLogout} className="header-button secondary-button">
                    Logout
                </button>
            )}
        </nav>
      </header>
      
      {/* --- HERO SECTION (Unchanged) --- */}
      <section className="hero-section">
        <div className="hero-content">
            <h1>At-Home Lab Tests, Quick Reports.</h1>
            <p className="subtext">
                Book blood tests & health packages from the comfort of your home. Reports within 24 hours.
            </p>
            
            <form onSubmit={handleSearch} className="search-bar-form">
                <input
                    type="text"
                    placeholder="Search for test names or health packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    required
                />
                <button type="submit" className="search-button">
                    Search Now
                </button>
            </form>
            
            <div className="cta-buttons">
                <button className="cta-package-button" onClick={() => navigate('/tests')}>
                    Explore All Packages
                </button>
                <div className="trust-badges">
                    <span>✅ NABL Accredited</span>
                    <span>⏱️ Free Home Sample Collection</span>
                </div>
            </div>
        </div>
        
        <div className="hero-image-placeholder">
            <div className="illustration-box">
                <span role="img" aria-label="Microscope">🔬</span>
                <p>Fast, Reliable, Certified.</p>
            </div>
        </div>
      </section>
      
      {/* --- FEATURED TESTS (Now functional) --- */}
      <section className="featured-tests-section">
          <h2>Popular Health Checks Near You</h2>
          <p className="section-subtext">Book our most popular packages and single tests instantly.</p>
          <div className="test-grid">
              {/* Use the TestCard component with mock data */}
              {featuredTests.map(test => (
                  <TestCard 
                      key={test.id} 
                      test={test} 
                      onAddToCart={handleAddToCart}
                       onDetailsClick={handleDetailsClick} 
                        
                  />
              ))}
          </div>
          <div className="view-all-link">
              <span onClick={() => navigate('/tests')}>View All {MOCK_TESTS.length} Tests & Packages →</span>
          </div>
      </section>
      
      {/* --- HOW IT WORKS & FOOTER (Unchanged) --- */}
      <section className="how-it-works-section">
          <h2>How PiiderLab Works</h2>
          <div className="step-cards">
              <div className="step-card">1. Book Online</div>
              <div className="step-card">2. Sample Collected</div>
              <div className="step-card">3. Report Delivered</div>
          </div>
      </section>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} PiiderLab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;