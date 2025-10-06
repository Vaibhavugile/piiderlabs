// src/pages/TestDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TESTS } from '../data/TestListingData'; 
import { useCart } from '../context/CartContext';
import './TestDetailPage.css'; 

// Mock Data Enhancements for UI/UX (Social Proof)
const MOCK_DETAIL_ENHANCEMENTS = {
    'full-body-health-checkup-advanced': { bookedCount: '15.4K', discount: '25%' },
    'vitamin-d-25-oh': { bookedCount: '2.1K', discount: '15%' },
    'diabetes-care-package': { bookedCount: '9.8K', discount: '20%' },
    'lipid-profile-test': { bookedCount: '4.5K', discount: '10%' },
    'complete-blood-count': { bookedCount: '107K', discount: '15%' }, // High social proof for CBC
};

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
            // Merge test data with UI enhancements (like bookedCount)
            const enhancedTest = {
                ...foundTest,
                ...MOCK_DETAIL_ENHANCEMENTS[foundTest.slug] 
            };
            setTest(enhancedTest);
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

    // Determine the calculated price for the MRP display
    const mrpPrice = ((test.price / 0.85) * 1.0).toFixed(2); // Assuming 15% off for a good visual
    const testDetails = test.testDetails;


    // Render the detailed test page
    return (
        <div className="detail-container">
            <header className="detail-header">
                <span className="back-link" onClick={() => navigate('/tests')}>← Back to All Tests</span>
                <h1>{test.name}</h1>
                {/* Test Alias added for better info hierarchy */}
                <p className="test-alias">Also Known As: {test.includes.join(', ')}</p>
            </header>
            
            <main className="test-detail-content">
                
                {/* Sticky Booking Card (Left Panel) */}
                <div className="main-info-card">
                    
                    {/* 1. Price Box with Social Proof */}
                    <div className="price-box">
                        <div className="price-info">
                             <span className="current-price">₹{test.price.toFixed(2)}</span>
                            <span className="mrp-price">MRP: ₹{mrpPrice}</span>
                        </div>
                       
                        {test.bookedCount && (
                            <div className="social-proof">
                                <span role="img" aria-label="People booked">⭐</span>
                                <strong>{test.bookedCount}</strong> people booked this test
                            </div>
                        )}
                    </div>

                    {/* 2. Action Row (Buttons) */}
                    <div className="action-row">
                        <button className="primary-button add-to-cart-btn-lg" onClick={handleAddToCart}>
                            Book Now at ₹{test.price.toFixed(2)}
                        </button>
                        <button className="secondary-button view-cart-btn" onClick={() => navigate('/cart')}>
                             <span role="img" aria-label="Cart">🛒</span> Cart
                        </button>
                    </div>

                    {/* 3. Promo Offers (Key UX element from reference) */}
                    <div className="promo-offers">
                         <h3 className="promo-heading">Special Offers</h3>
                        <div className="promo-item">
                            <strong><span role="img" aria-label="Offer">💸</span> NEWUSER15</strong> 
                            <span>Get 15% OFF on 1st order</span>
                        </div>
                        <div className="promo-item">
                            <strong><span role="img" aria-label="Offer">👨‍👩‍👧‍👦</span> FAMILY</strong> 
                            <span>Add a Family Member & Get 30% off</span>
                        </div>
                    </div>


                    {/* 4. Quick Facts / Trust Markers */}
                    <div className="quick-facts">
                         <h3 className="facts-heading">Requisites & Delivery</h3>
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Home">🏠</span> Sample Collection:</strong> 
                            <span>Free Home Collection</span>
                        </div>
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Time">⏱️</span> Report Time:</strong> 
                            <span>{test.reportTime}</span>
                        </div>
                        <div className="fact-item">
                            <strong><span role="img" aria-label="Fasting">🍽️</span> Preparation:</strong> 
                            <span>{test.preparation}</span>
                        </div>
                         <div className="fact-item">
                            <strong><span role="img" aria-label="Trust">🔬</span> Sample Type:</strong> 
                            <span>Blood Sample</span>
                        </div>
                    </div>
                </div>

                {/* Content Sections (Right Panel) */}
                <div className="sections-container">
                    
                    {/* 1. ABOUT THE TEST */}
                    <section className="detail-section">
                        <h2>About The Test</h2>
                        <p>{testDetails.about}</p>
                    </section>
                    
                    {/* 2. LIST OF PARAMETERS */}
                    <section className="detail-section">
                        <h2>List of Parameters Included ({testDetails.markers.length})</h2>
                        <p>The following are the key components measured in this test:</p>
                        <ul className="included-tests-list">
                            {testDetails.markers.map((marker, index) => (
                                <li key={index}>
                                    <strong>{marker.name}:</strong> {marker.info}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 3. TEST PREPARATION */}
                    <section className="detail-section">
                        <h2>Test Preparation</h2>
                        <ul className="preparation-list">
                            {testDetails.preparationDetails.map((step, index) => (
                                <li key={index}>
                                     <span role="img" aria-label="Check">✔️</span> {step}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 4. WHY THIS TEST */}
                    <section className="detail-section">
                         <h2>Why Take This Test?</h2>
                         <ul className="why-take-list">
                            {testDetails.whyTakeTest.map((reason, index) => (
                                <li key={index}>
                                     <span role="img" aria-label="Question">❓</span> {reason}
                                </li>
                            ))}
                        </ul>
                    </section>
                    
                    {/* 5. INTERPRETATION / RESULTS */}
                    <section className="detail-section">
                         <h2>Results & Interpretation Guide</h2>
                         <p>The table below shows the key markers, their units, and the typical biological reference range. Always consult a doctor for official interpretation.</p>
                         
                         <table className="results-table">
                             <thead>
                                 <tr>
                                     <th>Parameter</th>
                                     <th>Units</th>
                                     <th>Normal Range</th>
                                     <th>What it Indicates</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {testDetails.interpretationTableData.map((data, index) => (
                                     <tr key={index}>
                                         <td>{data.parameter}</td>
                                         <td>{data.units}</td>
                                         <td>{data.normalRange}</td>
                                         <td>{data.indicator}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TestDetailPage;