// src/pages/HomePage.js

import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MOCK_TESTS, TestCard } from '../data/TestListingData'; 

// 🎯 ACTION REQUIRED: You MUST replace these paths with the actual paths to your saved images.
import heroImage1 from '../assets/hero14.png';
import heroImage2 from '../assets/hero15.png';
import heroImage3 from '../assets/hero12.png';
import logo from '../assets/piiderlogo.jpg';
import './HomePage.css'; 

// --- SLIDE DATA ARRAY (Final content structure) ---
const HERO_SLIDES = [
    {
        preHeadline: "Comprehensive Diagnostics",
        headline: "The Future of Health Diagnostics",
        price: null,
        subtext: "Book NABL certified lab tests and health packages with free sample collection.",
        badgeText: "Reports within 6-24 hours",
        image: heroImage1,
        imageAlt: "Health professional and patient with diagnostic device",
    },
    {
        preHeadline: "Quick & Reliable Testing",
        headline: "Down with Fever? Get reports in 6 hours",
        price: null,
        subtext: "Fast and reliable fever panel tests with complimentary home sample collection.",
        badgeText: "Reports in 6 hours",
        image: heroImage2,
        imageAlt: "Phlebotomist collecting a blood sample",
    },
    {
        preHeadline: "Prevention is better than cure",
        headline: "Full Body Checkups start @",
        price: "₹1599",
        subtext: "Comprehensive health packages with Vitamin D & B12. Reports delivered fast.",
        badgeText: "Reports in 6 hours",
        image: heroImage3,
        imageAlt: "Man giving an 'OK' sign after a health checkup",
    },
];
// ----------------------------------------


const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const { totalItems, addItem } = useCart(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // State for Slider
  const navigate = useNavigate();
  
  const userName = currentUser ? currentUser.fullName || currentUser.email : '';
  const currentSlide = HERO_SLIDES[currentSlideIndex]; // Current slide object
const [activeSlide, setActiveSlide] = useState(0);
const [carouselPaused, setCarouselPaused] = useState(false);
const carouselViewportRef = React.useRef(null);
const carouselTrackRef = React.useRef(null);


  // --- SLIDER AUTO-ADVANCE LOGIC ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
        setCurrentSlideIndex((prevIndex) => 
            (prevIndex + 1) % HERO_SLIDES.length
        );
    }, 5000); // Change slide every 5 seconds (5000ms)

    return () => clearInterval(slideInterval); // Cleanup on unmount
  }, []);
  // ------------------------------------
  
  const handleLogout = () => { 
    logout()
        .then(() => {
          navigate('/'); 
        })
        .catch(error => console.error("Logout error:", error));
  } 

  const handleDetailsClick = (testId) => {
      const testToView = MOCK_TESTS.find(t => t.id === testId);
      if (testToView && testToView.slug) {
          navigate(`/tests/${testToView.slug}`);
      } else {
          console.error(`Test with ID ${testId} not found or is missing a slug.`);
      }
  };

  const handleSearch = (e) => {
      e.preventDefault();
      navigate(`/tests?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleAddToCart = (test) => {
      addItem(test);
  }
  
  const featuredTests = MOCK_TESTS.filter(test => test.highlight);
  // ---- Carousel source data ----
const MIN_SLIDES = 2; // enough width to guarantee scroll movement

// Create a "View All" pseudo-card at the end
const viewAllItem = {
  id: 'view-all',
  _isViewAll: true,
  title: `View All ${MOCK_TESTS.length} Tests & Packages`,
};

// Build the base list: featured tests + the "View All" tile
const baseCarouselItems = [...featuredTests, viewAllItem];

// If there are too few items to scroll, repeat them until we reach MIN_SLIDES
const carouselItems = (() => {
  if (baseCarouselItems.length >= MIN_SLIDES) return baseCarouselItems;
  const out = [];
  let i = 0;
  while (out.length < MIN_SLIDES) {
    out.push({ ...baseCarouselItems[i % baseCarouselItems.length], _cloneIdx: i });
    i++;
  }
  return out;
})();

// === Carousel state & refs (use these lengths now) ===


// Scroll helpers
const scrollToIndex = (index) => {
  const viewport = carouselViewportRef.current;
  const track = carouselTrackRef.current;
  if (!viewport || !track) return;

  const child = track.children[index];
  if (!child) return;

  const left = child.offsetLeft - track.offsetLeft;
  viewport.scrollTo({ left, behavior: 'smooth' });
  setActiveSlide(index);
};

const goTo = (i) => scrollToIndex(i);
const slideNext = () => goTo((activeSlide + 1) % carouselItems.length);
const slidePrev = () => goTo((activeSlide - 1 + carouselItems.length) % carouselItems.length);

// Auto-advance every 4s, even if there are few items (we padded them)
useEffect(() => {
  if (carouselPaused || carouselItems.length <= 1) return;
  const id = setInterval(() => {
    slideNext();
  }, 4000);
  return () => clearInterval(id);
}, [activeSlide, carouselPaused, carouselItems.length]);

// Sync active dot when user drags/scrolls
useEffect(() => {
  const viewport = carouselViewportRef.current;
  const onScroll = () => {
    const track = carouselTrackRef.current;
    if (!viewport || !track) return;

    let closest = 0;
    let minDelta = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const child = track.children[i];
      const delta = Math.abs(child.offsetLeft - viewport.scrollLeft);
      if (delta < minDelta) { minDelta = delta; closest = i; }
    }
    setActiveSlide(closest);
  };
  if (viewport) viewport.addEventListener('scroll', onScroll, { passive: true });
  return () => viewport && viewport.removeEventListener('scroll', onScroll);
}, []);



  return (
    <div className="homepage-container">
      {/* --- HEADER/NAVBAR --- */}
      <header className="app-header">
        <div className="logo" onClick={() => navigate('/')}>
          <img 
                            src={logo} // Dynamic image source
                        />
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
            <button className="header-button cart-button" onClick={() => navigate('/cart')}>
                🛒 Cart ({totalItems})
            </button>
            
            {currentUser && (
                <button onClick={handleLogout} className="header-button secondary-button">
                    Logout
                </button>
            )}
        </nav>
      </header>
      
      {/* -------------------------------------------------------------------- */}
      {/* --- HERO SECTION: FINAL HIGH-IMPACT LAYOUT --- */}
      {/* -------------------------------------------------------------------- */}
      <section className="hero-section">
          {/* Main card container with rounded white background and shadow */}
          <div className="hero-main-card">
              
              <div className="hero-content-wrapper">
                  
                  {/* Left Column: Text and Search Block */}
                  <div key={currentSlideIndex} className="hero-main-content slide-text-content">
                      
                      <p className="hero-pre-headline">{currentSlide.preHeadline}</p>

                      <h1 className="hero-headline">
                          {/* If a price exists, render the '@ price' as a highlighted segment */}
                          {currentSlide.price ? (
                            <>
                              {currentSlide.headline} <span className="highlight-text">@ {currentSlide.price}</span>
                            </>
                          ) : (
                            currentSlide.headline
                          )}
                      </h1>
                      
                      {/* Reports badge */}
                      <div className="hero-badge">
                          {currentSlide.badgeText}
                      </div>
                      
                      <p className="hero-subtext">
                          {currentSlide.subtext}
                      </p>

                      {/* MODERN SEARCH BLOCK */}
                      <div className="modern-search-block">
                          
                          <form onSubmit={handleSearch} className="search-bar-form-modern" role="search" aria-label="Search tests">
                              <input
                                  type="text"
                                  placeholder="Search for tests or checkups"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="search-input-modern"
                                  required
                              />
                              <div className="search-buttons-group" role="group" aria-label="Search categories">
                                  <button type="submit" className="search-button-group lab-tests-btn">
                                      Lab Tests 🔬
                                  </button>
                                  <button type="button" className="search-button-group checkups-btn" onClick={() => navigate('/tests?category=checkups')}>
                                      Checkups ✅
                                  </button>
                              </div>
                          </form>
                      </div>
                      
                      {/* Offer Badge below Search Block */}
                      <div className="search-offer-badge">
                          Get 15% OFF* on orders above ₹500 | Use: ORANGE15
                      </div>
                      
                      {/* SLIDER CONTROLS (Dots) */}
                      <div className="slider-dots-container" aria-hidden="false">
                          {HERO_SLIDES.map((_, index) => (
                              <button
                                  key={index}
                                  className={`slider-dot ${index === currentSlideIndex ? 'active' : ''}`}
                                  onClick={() => setCurrentSlideIndex(index)}
                                  aria-label={`Go to slide ${index + 1}`}
                                  style={{ border: 'none', background: 'transparent', padding: 0 }}
                              >
                                  <span className={`slider-dot ${index === currentSlideIndex ? 'active' : ''}`} />
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Right Column: Dynamic Image (wrapped for cropping / styling) */}
                  <div className="hero-image-container" aria-hidden="true">
                      <div className="hero-image-wrapper keyframe-fade-image" key={currentSlideIndex + '-wrapper'}>
                        <img 
                            key={currentSlideIndex + '-img'} // Separate key for image to trigger animation
                            src={currentSlide.image} // Dynamic image source
                            alt={currentSlide.imageAlt} // Dynamic image alt text
                            className="hero-main-image" 
                        />
                      </div>

                      {/* decorative glow behind image */}
                      <div className="image-blob-background" />
                  </div>
              </div>
          </div>

          {/* Trust Badges moved outside the card, using the CSS class hero-trust-badges */}
          {/* <div className="hero-trust-badges" aria-hidden="false">
              <span>⭐ 4.8/5 Rated Service</span>
              <span>✅ NABL & ICMR Certified</span>
              <span>⏱️ Free Home Collection</span>
          </div> */}
      </section>
      
      {/* --- FEATURED TESTS (Unchanged) --- */}
     {/* === POPULAR CHECKS — AUTO CAROUSEL === */}
<section className="carousel-section"
         onMouseEnter={() => setCarouselPaused(true)}
         onMouseLeave={() => setCarouselPaused(false)}>
  <h2>Popular Health Checks Near You</h2>
  <p className="section-subtext">Book our most popular packages and single tests instantly.</p>

  <div className="carousel-viewport" ref={carouselViewportRef}>
    <div className="carousel-track" ref={carouselTrackRef}>
      {carouselItems.map((item, idx) => (
        <div className="carousel-item" key={`${item.id}-${item._cloneIdx ?? 'base'}`}>
          {item._isViewAll ? (
            <button
              className="view-all-card"
              onClick={() => navigate('/tests')}
              aria-label="View all tests and packages"
            >
              <div className="va-body">
                <div className="va-title">{item.title}</div>
                <div className="va-cta">Browse All →</div>
              </div>
            </button>
          ) : (
            <TestCard
              test={item}
              onAddToCart={handleAddToCart}
              onDetailsClick={handleDetailsClick}
              variant="compact"
            />
          )}
        </div>
      ))}
    </div>
  </div>

  <div className="carousel-controls">
    <button className="carousel-arrow" onClick={slidePrev} aria-label="Previous">←</button>

    <div className="carousel-dots">
      {carouselItems.map((_, i) => (
        <button
          key={i}
          className={`carousel-dot ${i === activeSlide ? 'active' : ''}`}
          onClick={() => goTo(i)}
          aria-label={`Go to item ${i + 1}`}
        />
      ))}
    </div>

    <button className="carousel-arrow" onClick={slideNext} aria-label="Next">→</button>
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
