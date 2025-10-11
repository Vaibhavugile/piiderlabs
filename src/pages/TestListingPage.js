// src/pages/TestListingPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import useCart
import { useAuth } from '../context/AuthContext';
import {  MOCK_TESTS,
  TestCard,
  CATEGORIES,
  ORGANS,
  CONCERNS,
  SEASONS} from '../data/TestListingData'; 
import './TestListingPage.css'; 

const TestListingPage = () => {
    const { currentUser } = useAuth();
    const { addItem } = useCart(); // Get addItem function
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); 
    const [searchParams, setSearchParams] = useSearchParams();
const has = (arr, key) => Array.isArray(arr) && arr.includes(key);
const textMatch = (t, q) =>
  t.name.toLowerCase().includes(q) ||
  (Array.isArray(t.includes) && t.includes.some(i => String(i).toLowerCase().includes(q)));
const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
const category = searchParams.get('category') || '';
const organ    = searchParams.get('organ') || '';
const concern  = searchParams.get('concern') || '';
const season   = searchParams.get('season') || '';
const sort     = searchParams.get('sort') || ''; // optional: 'trending' | 'price-asc' | 'price-desc'

useEffect(() => {
  setSearchQuery(searchParams.get('search') || '');
}, [searchParams]);

    // ---------------------------------------------
    // 1. FILTERING LOGIC 
    // ---------------------------------------------
   const filteredTests = useMemo(() => {
  let list = [...MOCK_TESTS];

  // facet filters
  if (category) list = list.filter(t => has(t.categories, category));
  if (organ)    list = list.filter(t => has(t.organs, organ));
  if (concern)  list = list.filter(t => has(t.concerns, concern));
  if (season)   list = list.filter(t => has(t.seasons, season));

  // text filter
  const q = (searchQuery || '').toLowerCase().trim();
  if (q) list = list.filter(t => textMatch(t, q));

  // optional sort
  if (sort === 'trending') list.sort((a,b) => (b.trendingScore||0) - (a.trendingScore||0));
  if (sort === 'price-asc') list.sort((a,b) => (a.price||0) - (b.price||0));
  if (sort === 'price-desc') list.sort((a,b) => (b.price||0) - (a.price||0));

  return list;
}, [searchQuery, category, organ, concern, season, sort]);


// normalize for safe array checks


    // ---------------------------------------------
    // 2. SEARCH HANDLERS 
    // ---------------------------------------------
   const handleSearchSubmit = (e) => {
  e.preventDefault();
  const next = new URLSearchParams(searchParams);
  if (searchQuery) next.set('search', searchQuery);
  else next.delete('search');
  setSearchParams(next);
};
const clearAllFilters = () => setSearchParams(new URLSearchParams());
const setSort = (val) => {
  const next = new URLSearchParams(searchParams);
  if (val) next.set('sort', val); else next.delete('sort');
  setSearchParams(next);
};


    // ---------------------------------------------
    // 3. CART HANDLER
    // ---------------------------------------------
    const handleAddToCart = (test) => {
        addItem(test);
        alert(`Added ${test.name} to your cart!`);
    }

    // ---------------------------------------------
    // 4. DETAIL NAVIGATION HANDLER (FIX)
    // ---------------------------------------------
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


    return (
        <div className="test-listing-container">
            <header className="listing-header">
                <h1>All Health Tests & Packages</h1>
                <p>Choose from over 50+ lab tests and packages for collection at home.</p>
                
                {/* Search Bar for this page */}
                <form onSubmit={handleSearchSubmit} className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search by test name or marker..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
                {/* Active filters row */}
<div className="active-filters" style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',marginTop:10}}>
  {(category || organ || concern || season || searchQuery) ? (
    <>
      {category && <span className="pill">Category: {CATEGORIES.find(c=>c.key===category)?.label || category}</span>}
      {organ && <span className="pill">Organ: {ORGANS.find(o=>o.key===organ)?.label || organ}</span>}
      {concern && <span className="pill">Concern: {CONCERNS.find(c=>c.key===concern)?.label || concern}</span>}
      {season && <span className="pill">Season: {SEASONS.find(s=>s.key===season)?.label || season}</span>}
      {searchQuery && <span className="pill">Search: “{searchQuery}”</span>}
      <button className="link-like" onClick={clearAllFilters}>Clear all</button>
    </>
  ) : (
    <span style={{color:'#6c757d'}}>Tip: use filters or search to narrow results.</span>
  )}

  {/* Sort control */}
  <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
    <label htmlFor="sort" style={{color:'#6c757d'}}>Sort</label>
    <select id="sort" value={sort} onChange={e=>setSort(e.target.value)}>
      <option value="">Relevance</option>
      <option value="trending">Trending</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
    </select>
  </div>
</div>

            </header>

            {/* Display results */}
            <section className="test-grid">
                {filteredTests.length > 0 ? (
                    filteredTests.map(test => (
                        <TestCard 
                            key={test.id} 
                            test={test} 
                            onAddToCart={handleAddToCart}
                            // FIX: Passing the click handler function
                            onDetailsClick={handleDetailsClick} 
                            showFullDetails={true} // Display the 'Includes' list on the full page
                        />
                    ))
                ) : (
                    <div className="no-results">
                        No tests or packages found matching "{searchQuery}". Try a different term!
                    </div>
                )}
            </section>

            <div className="back-link">
                <span onClick={() => navigate('/')}>← Back to Home</span>
            </div>
        </div>
    );
};

export default TestListingPage;