// src/data/TestListingData.js

import React from 'react';
// We don't need to use `useNavigate` here, we'll pass the handler from the parent.

// --- MOCK DATA ---
// NOTE: I've added a dummy URL-friendly ID (slug) to the tests for the URL.
export const MOCK_TESTS = [
    {
        id: 'pkg-101',
        slug: 'full-body-health-checkup-advanced', // <-- NEW SLUG
        name: 'Full Body Health Checkup (Advanced)',
        price: 1899.00,
        highlight: true,
        includes: ['CBC', 'Liver Profile', 'Kidney Profile', 'Thyroid Profile'],
        description: 'Comprehensive annual checkup covering 70+ parameters. Recommended for all ages.',
        reportTime: '24 hours',
        preparation: '10-12 hours fasting is required.',
        testDetails: { // <-- NEW DETAIL SECTION
            purpose: "To provide a complete overview of your health status across multiple organs and systems.",
            markers: [
                { name: 'CBC', info: 'Checks for anemia, infection, and blood health.' },
                { name: 'Lipid Profile', info: 'Measures cholesterol and triglycerides.' },
                { name: 'LFT', info: 'Assesses liver function (SGOT, SGPT, Bilirubin).' },
                { name: 'KFT', info: 'Checks kidney function (Creatinine, Urea).' },
            ]
        }
    },
    {
        id: 'test-205',
        slug: 'vitamin-d-25-oh', // <-- NEW SLUG
        name: 'Vitamin D (25-OH)',
        price: 899.00,
        highlight: true,
        includes: ['25-Hydroxy Vitamin D'],
        description: 'Measures the body\'s main storage form of Vitamin D. Crucial for bone health.',
        reportTime: '18 hours',
        preparation: 'No fasting required.',
        testDetails: {
            purpose: "Determine if vitamin D levels are sufficient, low, or toxic.",
            markers: [
                { name: '25-OH Vitamin D', info: 'The primary marker for Vitamin D status.' }
            ]
        }
    },
    {
        id: 'pkg-103',
        slug: 'diabetes-care-package', // <-- NEW SLUG
        name: 'Diabetes Care Package',
        price: 950.00,
        highlight: true,
        includes: ['HbA1c', 'Fasting Glucose', 'Lipid Profile'],
        description: 'A dedicated package for monitoring and managing diabetes risk and conditions.',
        reportTime: '24 hours',
        preparation: '10-12 hours overnight fasting is required.',
        testDetails: {
            purpose: "Diagnose or monitor diabetes and assess the risk of cardiovascular complications.",
            markers: [
                { name: 'HbA1c', info: 'Measures average blood sugar over the past 2-3 months.' },
                { name: 'Fasting Glucose', info: 'Blood sugar reading after an overnight fast.' },
                { name: 'Triglycerides', info: 'A type of fat in the blood, often high in diabetics.' }
            ]
        }
    },
    {
        id: 'test-301',
        slug: 'lipid-profile-test', // <-- NEW SLUG
        name: 'Lipid Profile Test',
        price: 550.00,
        highlight: false,
        includes: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'],
        description: 'Assesses the risk of heart and vascular diseases by checking fat levels in the blood.',
        reportTime: '12 hours',
        preparation: '8-10 hours fasting required.',
        testDetails: {
            purpose: "To evaluate cardiovascular risk by measuring different types of fat (lipids) in the blood.",
            markers: [
                { name: 'Total Cholesterol', info: 'Overall cholesterol level.' },
                { name: 'LDL', info: 'Low-density lipoprotein ("bad" cholesterol).' },
                { name: 'HDL', info: 'High-density lipoprotein ("good" cholesterol).' }
            ]
        }
    },
];

/**
 * Component to display a single test card.
 * Added: onDetailsClick handler for navigation.
 */
// src/data/TestListingData.js

// --- Reusable Test Card Component ---
// 💡 Add onDetailsClick to the destructured props.
export const TestCard = ({ test, onAddToCart, onDetailsClick, showFullDetails = false }) => {
    return (
        <div className="test-card">
            {test.highlight && <span className="badge">POPULAR</span>}
            <h3 className="test-name">{test.name}</h3>
            <p className="test-desc">{test.description}</p>
            
            <div className="test-details">
                {showFullDetails && (
                    <ul className="test-includes">
                        {test.includes.map((item, index) => (
                            <li key={index}>✓ {item}</li>
                        ))}
                    </ul>
                )}
                <div className="report-time">
                    ⏱️ Report in {test.reportTime}
                </div>
            </div>

            <div className="card-footer">
                <span className="test-price">₹{test.price.toFixed(2)}</span>
                
                {/* 1. New Button to view details.
                  2. Use e.stopPropagation() to prevent the click from affecting any parent click handlers.
                */}
                <button 
                    className="secondary-button view-details-btn"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        // Call the function passed from the parent with the test's ID
                        onDetailsClick(test.id); 
                    }}
                >
                    View Details
                </button>

                <button 
                    className="primary-button add-to-cart-btn"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onAddToCart({ id: test.id, name: test.name, price: test.price });
                    }}
                >
                    + Add to Cart
                </button>
            </div>
        </div>
    );
};