// src/pages/TestDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TESTS } from '../data/TestListingData'; 
import { useCart } from '../context/CartContext';
import './TestDetailPage.css'; 

const TestDetailPage = () => {
    // Get the dynamic part of the URL (the slug)
    const { testId: testSlug } = useParams(); 
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Find the test data matching the slug
        const foundTest = MOCK_TESTS.find(t => t.slug === testSlug);
        
        if (foundTest) {
            setTest(foundTest);
        }
        
        // This simulates a slight network delay (for a real Firebase fetch)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300); 

        return () => clearTimeout(timer); // Cleanup
    }, [testSlug]);

    const handleAddToCart = () => {
        if (test) {
            addItem({ id: test.id, name: test.name, price: test.price });
            alert(`Added ${test.name} to cart!`);
        }
    }

    if (loading) {
        return (
            <div className="detail-container loading-state">
                <p>Loading test details...</p>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="detail-container not-found">
                <h1>404 - Test Not Found</h1>
                <p>The health test you are looking for does not exist.</p>
                <button className="primary-button" onClick={() => navigate('/tests')}>
                    View All Tests
                </button>
            </div>
        );
    }

    // Render the detailed test page
    return (
        <div className="detail-container">
            <header className="detail-header">
                <span className="back-link" onClick={() => navigate('/tests')}>← Back to All Tests</span>
                <h1>{test.name}</h1>
            </header>
            
            <main className="test-detail-content">
                <div className="main-info-card">
                    <p className="test-description">{test.description}</p>
                    
                    <div className="price-box">
                        <span className="current-price">₹{test.price.toFixed(2)}</span>
                        {/* Add a fake discounted price for visual appeal */}
                        <span className="mrp-price">MRP: ₹{((test.price / 0.75) * 1.0).toFixed(2)}</span>
                    </div>

                    <div className="action-row">
                        <button className="primary-button add-to-cart-btn-lg" onClick={handleAddToCart}>
                            Book Now at ₹{test.price.toFixed(2)}
                        </button>
                        <button className="secondary-button view-cart-btn" onClick={() => navigate('/cart')}>
                            Go to Cart
                        </button>
                    </div>

                    <div className="quick-facts">
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Home">🏠</span> Sample Collection:</strong> Free Home Collection
                        </div>
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Time">⏱️</span> Report Time:</strong> {test.reportTime}
                        </div>
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Fasting">🍽️</span> Preparation:</strong> {test.preparation}
                        </div>
                    </div>
                </div>

                <div className="sections-container">
                    {/* Purpose Section */}
                    <section className="detail-section">
                        <h2>Purpose of the Test</h2>
                        <p>{test.testDetails.purpose}</p>
                    </section>

                    {/* Includes/Markers Section */}
                    <section className="detail-section">
                        <h2>Tests Included ({test.includes.length} Parameters)</h2>
                        <ul className="included-tests-list">
                            {test.testDetails.markers.map((marker, index) => (
                                <li key={index}>
                                    <strong>{marker.name}:</strong> {marker.info}
                                </li>
                            ))}
                            {/* Fallback display for any markers not in testDetails.markers */}
                            {test.includes.length > test.testDetails.markers.length && (
                                <li className="more-info">And more...</li>
                            )}
                        </ul>
                    </section>
                </div>

            </main>
        </div>
    );
};

export default TestDetailPage;