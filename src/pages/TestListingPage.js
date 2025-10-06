// src/pages/TestListingPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import useCart
import { useAuth } from '../context/AuthContext';
import { MOCK_TESTS, TestCard } from '../data/TestListingData'; 
import './TestListingPage.css'; 

const TestListingPage = () => {
    const { currentUser } = useAuth();
    const { addItem } = useCart(); // Get addItem function
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [loading, setLoading] = useState(false); 
    
    // ---------------------------------------------
    // 1. FILTERING LOGIC 
    // ---------------------------------------------
    const filteredTests = useMemo(() => {
        if (!searchQuery) {
            return MOCK_TESTS;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();
        
        return MOCK_TESTS.filter(test => 
            test.name.toLowerCase().includes(lowerCaseQuery) ||
            test.includes.some(item => item.toLowerCase().includes(lowerCaseQuery))
        );
    }, [searchQuery]);


    // ---------------------------------------------
    // 2. SEARCH HANDLERS 
    // ---------------------------------------------
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Update URL search parameter
        navigate(`/tests?search=${searchQuery}`);
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