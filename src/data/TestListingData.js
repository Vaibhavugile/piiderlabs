// src/data/TestListingData.js

import React from 'react';
// We don't need to use `useNavigate` here, we'll pass the handler from the parent.

// --- MOCK DATA ---
export const MOCK_TESTS = [
    {
        id: 'pkg-101',
        slug: 'full-body-health-checkup-advanced',
        name: 'Full Body Health Checkup (Advanced)',
        price: 1899.00,
        highlight: true,
        includes: ['CBC', 'Liver Profile', 'Kidney Profile', 'Thyroid Profile'],
        description: 'Comprehensive annual checkup covering 70+ parameters. Recommended for all ages.',
        reportTime: '24 hours',
        preparation: '10-12 hours fasting is required.',
        testDetails: { 
            purpose: "To provide a complete overview of your health status across multiple organs and systems.",
            markers: [
                { name: 'CBC', info: 'Checks for anemia, infection, and blood health.' },
                { name: 'Lipid Profile', info: 'Measures cholesterol and triglycerides.' },
                { name: 'LFT', info: 'Assesses liver function (SGOT, SGPT, Bilirubin).' },
                { name: 'KFT', info: 'Checks kidney function (Creatinine, Urea).' },
            ],
            about: "This comprehensive panel includes tests for key organs and systems to give you a full picture of your current health, covering everything from blood sugar and cholesterol to vitamin D levels and liver/kidney function.",
            preparationDetails: [
                'Fasting for 10-12 hours is mandatory for accurate glucose and lipid results.',
                'Only water is permitted during the fasting period.',
                'Inform your doctor about any medications you are currently taking.',
            ],
            whyTakeTest: [
                'Proactive Health Monitoring: Catch potential health issues before they become serious.',
                'Baseline Assessment: Establish a reference point for future health comparisons.',
                'Risk Factor Identification: Identify risks for chronic diseases like diabetes and heart disease.',
            ],
            interpretationTableData: [
                { parameter: 'Glucose', units: 'mg/dL', normalRange: '70-100', indicator: 'Screening for diabetes.' },
                { parameter: 'Total Cholesterol', units: 'mg/dL', normalRange: '< 200', indicator: 'Assessing heart disease risk.' },
                { parameter: 'Vitamin D', units: 'ng/mL', normalRange: '30-100', indicator: 'Essential for bone and immune health.' },
            ]
        }
    },
    {
        id: 'test-cbc-1',
        slug: 'complete-blood-count', // <-- NEW CBC TEST 
        name: 'Complete Blood Count (CBC) Test',
        price: 350.00,
        highlight: true,
        includes: ['RBCs', 'WBCs', 'Platelets', 'Haemoglobin', 'Haematocrit', 'MCV', 'MCH', 'MCHC', 'RDW'],
        description: 'The CBC test is a standard blood test that helps in assessing your general health and monitoring different cell types in the blood.',
        reportTime: '6 hours',
        preparation: 'No Fasting Required',
        testDetails: {
            purpose: "Measuring red blood cells, white blood cells, haemoglobin, hematocrit, and platelets to diagnose conditions like infection and anemia.",
            markers: [
                { name: 'WBCs (Leukocytes)', info: 'Crucial for fighting infections and play a key role in the immune system.' },
                { name: 'RBCs (Erythrocytes)', info: 'Carry oxygen from the lungs to the entire body.' },
                { name: 'Haemoglobin (Hb)', info: 'Iron-rich protein in RBCs that transports oxygen.' },
                { name: 'Platelet Count', info: 'Represents the total quantity of cells responsible for clotting.' },
            ],
            about: "The **Complete Blood Count (CBC)** test is a standard blood test that helps in assessing your general health. This test monitors the different types of cells present in the blood, such as red blood cells (RBCs), white blood cells (WBCs), and platelets, to diagnose health conditions. Additionally, it provides valuable information about the effects of medications or medical conditions on the body and helps assess the health of the immune system.",
            preparationDetails: [
                'No special preparations are required for a CBC test. It is a quick and simple blood draw.',
                'Fasting is **NOT** required unless you are taking other tests (like glucose) along with CBC.',
                'There are no specific cautions before taking the CBC test.',
            ],
            whyTakeTest: [
                '**Monitoring and diagnosing conditions:** Identifies and tracks issues like anemia, bleeding problems, infections, and some cancers.',
                '**Evaluation of unexplained symptoms:** Helps find the reason behind unexplained fatigue, weakness, bruising, or frequent infections.',
                '**Routine health check-ups:** Often done with a routine physical exam to set a baseline and track overall health.',
            ],
            interpretationTableData: [
                { parameter: 'RBC Count', units: 'mill/mm³', normalRange: '4.5 - 5.5', indicator: 'Low count may indicate anemia.' },
                { parameter: 'Haemoglobin (Hb)', units: 'g/dL', normalRange: '13.0 - 17.0', indicator: 'Low level indicates low oxygen transport.' },
                { parameter: 'WBC Count (TC)', units: 'cells/mm³', normalRange: '4000 - 10000', indicator: 'High count often indicates infection or inflammation.' },
                { parameter: 'Platelet Count', units: '10³/µL', normalRange: '150 - 450', indicator: 'Indicates blood clotting ability.' },
            ]
        }
    },
    // ... existing tests
    {
        id: 'test-205',
        slug: 'vitamin-d-25-oh', 
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
            ],
            about: "The Vitamin D (25-OH) test measures the most common form of Vitamin D stored in the body, giving an accurate assessment of your body's vitamin D status over time. Essential for calcium absorption, bone health, and immune function.",
            preparationDetails: [
                'No fasting is required for this test.',
                'Can be taken at any time of the day.',
            ],
            whyTakeTest: [
                'Identify deficiency which is common in many populations.',
                'Evaluate causes of weakness, bone pain, or recurrent infections.',
            ],
            interpretationTableData: [
                { parameter: '25-OH D', units: 'ng/mL', normalRange: '> 30', indicator: 'Optimal levels for health.' },
            ]
        }
    },
    {
        id: 'pkg-103',
        slug: 'diabetes-care-package',
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
            ],
            about: "This package provides a crucial assessment for diabetes management, combining an immediate glucose reading (Fasting Glucose) with a long-term average (HbA1c). It also includes a Lipid Profile to check for related cardiovascular risks.",
            preparationDetails: [
                'Strict fasting of 10-12 hours is required for accurate results.',
                'Do not smoke, chew gum, or drink anything except plain water during fasting.',
            ],
            whyTakeTest: [
                'Diagnose Prediabetes or Diabetes.',
                'Monitor the effectiveness of current diabetes treatment.',
                'Assess associated risks, particularly heart disease.',
            ],
            interpretationTableData: [
                { parameter: 'HbA1c', units: '%', normalRange: '< 5.7', indicator: 'High levels indicate poor long-term glucose control.' },
                { parameter: 'Fasting Glucose', units: 'mg/dL', normalRange: '70-100', indicator: 'High levels suggest immediate high blood sugar.' },
            ]
        }
    },
    {
        id: 'test-301',
        slug: 'lipid-profile-test',
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
            ],
            about: "The Lipid Profile Test measures the concentration of fats (lipids) in the bloodstream, including cholesterol and triglycerides. These measurements help assess your risk for developing cardiovascular disease.",
            preparationDetails: [
                'Fasting for 8-10 hours is required for the most accurate results, especially for triglycerides.',
            ],
            whyTakeTest: [
                'Routine screening to assess heart disease risk.',
                'Monitoring the effectiveness of cholesterol-lowering medication.',
                'Follow-up testing after abnormal previous results.',
            ],
            interpretationTableData: [
                { parameter: 'Total Cholesterol', units: 'mg/dL', normalRange: '< 200', indicator: 'High levels increase heart disease risk.' },
                { parameter: 'LDL Cholesterol', units: 'mg/dL', normalRange: '< 100', indicator: 'Primary target for cardiovascular health.' },
                { parameter: 'Triglycerides', units: 'mg/dL', normalRange: '< 150', indicator: 'High levels are associated with metabolic syndrome.' },
            ]
        }
    },
];

// --- Reusable Test Card Component (No changes needed) ---
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
                
                <button 
                    className="secondary-button view-details-btn"
                    onClick={(e) => {
                        e.stopPropagation(); 
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