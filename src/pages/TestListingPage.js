// src/pages/TestListingPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { MOCK_TESTS, TestCard } from "../data/TestListingData";
import "./TestListingPage.css";

const TestListingPage = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [filteredTests, setFilteredTests] = useState(MOCK_TESTS);

  const observerRef = useRef(null);

  // 🌟 Extract URL params for filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "";
    const organ = params.get("organ") || "";
    const concern = params.get("concern") || "";
    const season = params.get("season") || "";

    setSearchTerm(search);
    setActiveFilter(category || organ || concern || season || null);

    let results = MOCK_TESTS;

    if (search) {
      results = results.filter((test) =>
        test.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      results = results.filter((test) =>
        test.categories.includes(category)
      );
    }

    if (organ) {
      results = results.filter((test) => test.organs.includes(organ));
    }

    if (concern) {
      results = results.filter((test) => test.concerns.includes(concern));
    }

    if (season) {
      results = results.filter((test) => test.seasons.includes(season));
    }

    setFilteredTests(results);
  }, [location.search]);

  // ✨ Scroll-triggered fade-ins using IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll(".test-card");
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [filteredTests]);

  // 🌟 Add to cart
  const handleAddToCart = (test) => addItem(test);

  // 🔍 Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/tests?search=${encodeURIComponent(searchTerm)}`);
  };

  // 🧭 Clear filter
  const clearFilter = () => {
    setActiveFilter(null);
    navigate("/tests");
  };

  return (
    <div className="test-listing-container">
      {/* Header Section */}
      <header className="listing-header">
        <h1>Book Lab Tests & Health Checkups</h1>
        <p>
          Explore a wide range of NABL-certified diagnostic tests and full-body
          health packages.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search for tests or health checkups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* Active Filter Display */}
        {activeFilter && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span className="pill">{activeFilter}</span>
            <button onClick={clearFilter} className="link-like">
              Clear Filter ✕
            </button>
          </div>
        )}
      </header>

      {/* Grid of Tests */}
      <div className="test-grid">
        {filteredTests.length > 0 ? (
          filteredTests.map((test, i) => (
            <div
              key={test.id}
              className="test-card fade-item"
              style={{
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="test-header">
                <h2>{test.name}</h2>
                {test.popular && <span className="badge popular-badge">Popular</span>}
              </div>

              <p className="test-desc">{test.description}</p>

              <div className="test-price">₹{test.price}</div>

              <ul className="test-includes">
                {test.includes.slice(0, 3).map((inc, idx) => (
                  <li key={idx}>✔ {inc}</li>
                ))}
              </ul>

              <div className="report-time">Reports: {test.reportTime}</div>

              <div className="card-footer">
                <button
                  className="primary-button"
                  onClick={() => handleAddToCart(test)}
                >
                  Add to Cart
                </button>
                <button
                  className="secondary-button"
                  onClick={() => navigate(`/tests/${test.slug}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "40px", color: "#6c757d" }}>
            No tests found. Try another search or category.
          </p>
        )}
      </div>
    </div>
  );
};

export default TestListingPage;
