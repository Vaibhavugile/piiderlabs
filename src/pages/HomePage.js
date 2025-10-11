// src/pages/HomePage.js

import React, { useRef,useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {   MOCK_TESTS,
  TestCard,
  CATEGORIES,
  ORGANS,
  CONCERNS,
  SEASONS} from '../data/TestListingData'; 

// ðŸŽ¯ ACTION REQUIRED: You MUST replace these paths with the actual paths to your saved images.
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
        price: "â‚¹1599",
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
const carouselViewportRef = useRef(null);
const carouselTrackRef = useRef(null);
const [carouselPaused, setCarouselPaused] = useState(false);
// Add near other hooks:
const [menuOpen, setMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 6);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

useEffect(() => {
  const track = carouselTrackRef.current;
  if (!track) return;

  let scrollAmount = 0;
  const scrollSpeed = 0.3; // Adjust for faster/slower scroll
  let animationFrame;

  const scroll = () => {
    if (!carouselPaused) {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= track.scrollWidth / 2) {
        scrollAmount = 0; // reset seamlessly
      }
      track.scrollLeft = scrollAmount;
    }
    animationFrame = requestAnimationFrame(scroll);
  };
  

  // Duplicate items for seamless infinite scroll
  const cloneTrack = () => {
    const items = Array.from(track.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  };

  if (track.children.length && track.children.length < 20) cloneTrack();
  animationFrame = requestAnimationFrame(scroll);

  return () => cancelAnimationFrame(animationFrame);
}, [carouselPaused]);

// Build quick counts for chips
const countBy = (key, value) =>
  MOCK_TESTS.filter(t => Array.isArray(t[key]) && t[key].includes(value)).length;

// Navigate helpers
const goToCategory = (key) => navigate(`/tests?category=${encodeURIComponent(key)}`);
const goToOrgan    = (key) => navigate(`/tests?organ=${encodeURIComponent(key)}`);
const goToConcern  = (key) => navigate(`/tests?concern=${encodeURIComponent(key)}`);
const goToSeason   = (key) => navigate(`/tests?season=${encodeURIComponent(key)}`);

// Trending list (top N by score)
const TRENDING = [...MOCK_TESTS]
  .filter(t => Number.isFinite(t.trendingScore))
  .sort((a,b) => b.trendingScore - a.trendingScore)
  .slice(0, 8);


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


// === Carousel state & refs (use these lengths now) ===

// Scroll helpers
const scrollToIndex = (index) => {
  const viewport = carouselViewportRef.current;
  const track = carouselTrackRef.current;
  if (!viewport || !track) return;
  const child = track.children[index];
  if (!child) return;

  const left = child.offsetLeft - track.offsetLeft;
  viewport.scrollTo({ left, behavior: "smooth" });
  setActiveSlide(index);
};

const goTo = (i) => scrollToIndex(i);
const slideNext = () => goTo((activeSlide + 1) % carouselItems.length);
const slidePrev = () => goTo((activeSlide - 1 + carouselItems.length) % carouselItems.length);

/* ---------------------------
   AUTO-SCROLL INFINITE LOOP
--------------------------- */
useEffect(() => {
  const track = carouselTrackRef.current;
  if (!track) return;

  // Duplicate slides for seamless infinite scroll
  const clones = Array.from(track.children).map((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
    return clone;
  });

  let scrollPos = 0;
  const scrollSpeed = 0.4; // Adjust speed
  let frame;

  const smoothScroll = () => {
    if (!carouselPaused) {
      scrollPos += scrollSpeed;
      if (scrollPos >= track.scrollWidth / 2) scrollPos = 0;
      track.scrollLeft = scrollPos;
    }
    frame = requestAnimationFrame(smoothScroll);
  };

  frame = requestAnimationFrame(smoothScroll);
  return () => {
    cancelAnimationFrame(frame);
    clones.forEach((c) => c.remove());
  };
}, [carouselPaused, carouselItems.length]);


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

useEffect(() => {
  const track = document.querySelector(".season-track");
  let isDown = false;
  let startX;
  let scrollLeft;

  if (!track) return;

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.classList.add("active");
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener("mouseleave", () => {
    isDown = false;
    track.classList.remove("active");
  });
  track.addEventListener("mouseup", () => {
    isDown = false;
    track.classList.remove("active");
  });
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    track.scrollLeft = scrollLeft - walk;
  });
}, []);




  return (
    <div className="homepage-container">
      {/* --- HEADER/NAVBAR --- */}
     <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
  <div className="logo" onClick={() => navigate('/')} aria-label="Go to home">
    <img src={logo} alt="PiiderLab" />
  </div>

  {/* Desktop nav */}
  <nav className="header-nav">
    {currentUser ? (
      <>
        <span className="user-greeting">Hello, {userName.split(' ')[0]}</span>
        <button onClick={() => navigate('/dashboard')} className="header-button primary-button with-sheen">
          My Dashboard
        </button>
      </>
    ) : (
      <>
        <button onClick={() => navigate('/login')} className="header-button secondary-button">
          Login
        </button>
        <button onClick={() => navigate('/signup')} className="header-button primary-button with-sheen">
          Book a Test
        </button>
      </>
    )}

    <button className="header-button cart-button" onClick={() => navigate('/cart')} aria-label="Open cart">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="20" r="1.6" fill="currentColor"/>
        <circle cx="17" cy="20" r="1.6" fill="currentColor"/>
      </svg>
      <span className="cart-label">Cart</span>
      <span className="cart-badge">{totalItems}</span>
    </button>

    {currentUser && (
      <button onClick={handleLogout} className="header-button secondary-button">
        Logout
      </button>
    )}
  </nav>

  {/* Mobile hamburger */}
  <button
    className={`hamburger ${menuOpen ? 'open' : ''}`}
    onClick={() => setMenuOpen((v) => !v)}
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
  >
    <span />
    <span />
    <span />
  </button>

  {/* Mobile panel */}
  <div className={`mobile-panel ${menuOpen ? 'show' : ''}`}>
    {currentUser ? (
      <>
        <button onClick={() => { setMenuOpen(false); navigate('/dashboard'); }} className="mp-link">
          My Dashboard
        </button>
        <button onClick={() => { setMenuOpen(false); navigate('/cart'); }} className="mp-link">
          Cart ({totalItems})
        </button>
        <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="mp-link ghost">
          Logout
        </button>
      </>
    ) : (
      <>
        <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="mp-link ghost">
          Login
        </button>
        <button onClick={() => { setMenuOpen(false); navigate('/signup'); }} className="mp-link solid">
          Book a Test
        </button>
        <button onClick={() => { setMenuOpen(false); navigate('/cart'); }} className="mp-link">
          Cart ({totalItems})
        </button>
      </>
    )}
  </div>
</header>

      {/* -------------------------------------------------------------------- */}
      {/* --- HERO SECTION: FINAL HIGH-IMPACT LAYOUT --- */}
      {/* -------------------------------------------------------------------- */}
     {/* ====================== HERO SECTION (updated) ====================== */}
<section className="hero-section">
  {/* Main card container with rounded white background and shadow */}
  <div className="hero-main-card">
    <div className="hero-content-wrapper">
      {/* Left Column: Text + Search */}
      <div
        key={currentSlideIndex}
        className="hero-main-content slide-text-content"
        data-slide={currentSlideIndex}   // <-- enables subtle re-animate on slide change
      >
        <p className="hero-pre-headline">{currentSlide.preHeadline}</p>

        <h1 className="hero-headline">
          {currentSlide.price ? (
            <>
              {currentSlide.headline}{" "}
              <span className="highlight-text">@ {currentSlide.price}</span>
            </>
          ) : (
            currentSlide.headline
          )}
        </h1>

        {/* Reports badge */}
        <div className="hero-badge">{currentSlide.badgeText}</div>

        <p className="hero-subtext">{currentSlide.subtext}</p>

        {/* MODERN SEARCH BLOCK */}
        <div className="modern-search-block">
          <form
            onSubmit={handleSearch}
            className="search-bar-form-modern"
            role="search"
            aria-label="Search tests"
          >
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
                Lab Tests
              </button>
              <button
                type="button"
                className="search-button-group checkups-btn"
                onClick={() => navigate("/tests?category=checkups")}
              >
                Checkups
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
              className={`slider-dot ${index === currentSlideIndex ? "active" : ""}`}
              onClick={() => setCurrentSlideIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{ border: "none", background: "transparent", padding: 0 }}
            >
              <span className={`slider-dot ${index === currentSlideIndex ? "active" : ""}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Dynamic Image */}
      <div className="hero-image-container" aria-hidden="true">
        <div
          className="hero-image-wrapper keyframe-fade-image parallax-tilt" // <-- adds subtle 3D tilt on hover
          key={currentSlideIndex + "-wrapper"}
        >
          <img
            key={currentSlideIndex + "-img"} // Separate key for image to trigger animation
            src={currentSlide.image}
            alt={currentSlide.imageAlt}
            className="hero-main-image"
          />
        </div>

        {/* decorative glow behind image */}
        <div className="image-blob-background" />
      </div>
    </div>
  </div>

  {/* (Optional) Trust Badges */}
  {/* 
  <div className="hero-trust-badges" aria-hidden="false">
    <span>⭐ 4.8/5 Rated Service</span>
    <span>✅ NABL & ICMR Certified</span>
    <span>⏱️ Free Home Collection</span>
  </div> 
  */}
</section>

      {/* --- FEATURED TESTS (Unchanged) --- */}
     {/* === POPULAR CHECKS â€” AUTO CAROUSEL === */}
<section
  className="carousel-section"
  onMouseEnter={() => setCarouselPaused(true)}
  onMouseLeave={() => setCarouselPaused(false)}
>
  <h2>Popular Health Checks Near You</h2>
  <p className="section-subtext">Book our most popular packages and single tests instantly.</p>

  <div className="carousel-viewport" ref={carouselViewportRef}>
    <div className="carousel-track" ref={carouselTrackRef}>
      {carouselItems.map((item, idx) => (
        <div
          className="carousel-item"
          key={`${item.id}-${item._cloneIdx ?? 'base'}`}
          data-active={idx === activeSlide ? 'true' : 'false'}
        >
          {item._isViewAll ? (
            <button
              className="view-all-card"
              onClick={() => navigate('/tests')}
              aria-label="View all tests and packages"
            >
              <span className="va-sheen" />
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
    <button className="carousel-arrow" onClick={slidePrev} aria-label="Previous">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>

    <div className="carousel-dots">
      {carouselItems.map((_, i) => (
        <button
          key={i}
          className={`carousel-dot ${i === activeSlide ? 'active' : ''}`}
          onClick={() => goTo(i)}
          aria-label={`Go to item ${i + 1}`}
        >
          <span className="dot-fill" />
        </button>
      ))}
    </div>

    <button className="carousel-arrow" onClick={slideNext} aria-label="Next">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
</section>


{/* ===================== Search by Category ===================== */}
{/* === Search by Category (illustrated) === */}
{/* === Search by Category — Animated Spotlight Cards === */}
<section className="category-spotlight">
  <div className="cat-head">
    <h2>Search by Category</h2>
    <p>Browse routine checks, women's health, cardiac panels and more.</p>
  </div>

  <div className="cat-grid">
    {CATEGORIES.map((c, i) => (
      <button
        key={c.key}
        data-key={c.key}
        className="cat-card"
        style={{ animationDelay: `${i * 0.08}s` }}
        onClick={() => goToCategory(c.key)}
      >
        {/* bg image */}
        {c.img && (
          <div
            className="cat-bg"
            style={{ backgroundImage: `url(${c.img})` }}
          />
        )}

        {/* animated gradient blobs */}
        <span className="cat-blob a" />
        <span className="cat-blob b" />

        {/* sheen sweep */}
        <span className="cat-sheen" />

        {/* content */}
        <div className="cat-content">
          <span className="cat-icon">{c.icon}</span>
          <h3>{c.label}</h3>
          <span className="cat-count">{countBy('categories', c.key)} options</span>
        </div>
      </button>
    ))}
  </div>
</section>



{/* ===================== Search by Organ/System ===================== */}
{/* === Search by Organ / System (pro tiles) === */}
{/* === For Vital Body Organs (compact, Orange-style) === */}
{/* === For Vital Body Organs — compact === */}
{/* === Vital Body Organs Section — Modern Visual Layout === */}
<section className="organ-section">
  <div className="organ-header">
    <h2>For Vital Body Organs</h2>
    <p>Comprehensive health panels focused on your vital body systems</p>
  </div>

  <div className="organ-grid-modern">
    {ORGANS.map((o) => {
      const img = o.img || "";
      return (
        <button
          key={o.key}
          className="organ-card-modern"
          onClick={() => goToOrgan(o.key)}
          aria-label={o.label}
        >
          <div className="organ-img-wrapper">
            {img ? (
              <img
                src={img}
                alt={o.label}
                className="organ-modern-img"
                loading="lazy"
              />
            ) : (
              <span className="icon-fallback">{o.icon}</span>
            )}
          </div>
          <div className="organ-card-label">{o.label}</div>
        </button>
      );
    })}
  </div>
</section>





{/* ===================== Search by Concern / Life Stage ===================== */}
{/* === Search by Concern / Life Stage (icon chips) === */}
{/* === Search by Concern / Life Stage — Modern Animated === */}
{/* === Search by Concern / Life Stage — Animated Motion Section === */}
<section className="concern-section-animated">
  <div className="concern-header">
    <h2>Search by Concern / Life Stage</h2>
    <p>Explore personalized health checkups designed around your needs.</p>
  </div>

  <div className="concern-animated-grid">
    {CONCERNS.map((cn, i) => (
      <div
        key={cn.key}
        className="concern-animated-card"
        style={{ animationDelay: `${i * 0.12}s` }}
        onClick={() => goToConcern(cn.key)}
      >
        <div className="concern-card-bg" />
        <div className="concern-icon-bubble">
          <span className="concern-icon">{cn.icon}</span>
        </div>
        <div className="concern-card-text">
          <h3>{cn.label}</h3>
          <p>{countBy("concerns", cn.key)} options</p>
        </div>
      </div>
    ))}
  </div>
</section>




{/* ===================== Seasonal / Trending Tests ===================== */}
{/* === Seasonal / Trending (banners) === */}
{/* === Seasonal / Trending Tests — Animated Carousel === */}
<section className="seasonal-section">
  <div className="seasonal-header">
    <h2>Seasonal / Trending Tests</h2>
    <p>Stay ahead of seasonal health risks and trending checkups.</p>
  </div>

  <div className="season-carousel">
    <div className="season-track">
      {[...SEASONS, ...SEASONS].map((s, i) => (
        <div
          key={`${s.key}-${i}`}
          data-key={s.key}
          className="season-slide"
          onClick={() => goToSeason(s.key)}
        >
          {s.img && (
            <div
              className="slide-bg"
              style={{ backgroundImage: `url(${s.img})` }}
            />
          )}
          <div className="slide-overlay" />
          <div className="slide-content">
            {/* <div className="slide-icon">{s.icon}</div> */}
            <h3>{s.label}</h3>
            <span className="slide-cta">Explore →</span>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* trending compact grid below */}
  {/* <div className="test-grid compact" style={{ marginTop: 32 }}>
    {TRENDING.map((test) => (
      <TestCard
        key={test.id}
        test={test}
        onAddToCart={handleAddToCart}
        onDetailsClick={handleDetailsClick}
        variant="compact"
      />
    ))}
  </div>

  <div className="view-all-link" style={{ marginTop: 16 }}>
    <span onClick={() => navigate("/tests")}>
      View All {MOCK_TESTS.length} Tests & Packages →
    </span>
  </div> */}
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