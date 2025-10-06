import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserOrders, formatDate } from '../utils/orderUtils'; // ⬅️ IMPORTED UTILS
import './DashboardPage.css';

// The helper function and fetchUserOrders implementation were moved to orderUtils.js

const DashboardPage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    
    // --- STATE FOR DATA FETCHING ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        const loadOrders = async () => {
            if (!currentUser?.uid) {
                // If currentUser is null initially, wait for load, then redirect below.
                if (loading) setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const fetchedOrders = await fetchUserOrders(currentUser.uid); 
                setOrders(fetchedOrders);
            } catch (err) {
                console.error("Failed to load orders:", err);
                setError(err.message || "An unexpected error occurred while loading data.");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [currentUser?.uid]); 

    // --- LOGIC TO DERIVE DATA FOR CARDS (useMemo MUST be here, before conditional returns) ---
    const { upcomingBooking, recentReport } = useMemo(() => {
        // Orders are already sorted by date (newest first)
        return {
            // Find the MOST RECENT *Pending Collection* or *Confirmed* order
            upcomingBooking: orders.find(o => 
                o.status === 'Pending Collection' || o.status === 'Confirmed'
            ), 
            // Find the MOST RECENT *Report Ready* order
            recentReport: orders.find(o => o.status === 'Report Ready'), 
        };
    }, [orders]);

    // --- USER DISPLAY DATA (Must also be derived unconditionally) ---
    // Use optional chaining for safety as currentUser might be null during initial render/redirect.
    const userName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'User';
    
    // --- HANDLERS ---
    const handleViewReport = () => {
        if (recentReport) {
            navigate(`/reports/${recentReport.id}`); 
        }
    };

    const handleLogout = () => { 
        logout()
            .then(() => { navigate('/'); })
            .catch(error => console.error("Logout error:", error));
    } 

    // --- RENDER STATES (Conditional returns MUST be after all Hooks) ---
    if (!currentUser) {
        navigate('/login');
        return null;
    }
    
    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">Loading your dashboard... Please wait.</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-state">
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            
            <header className="dashboard-header">
                <div>
                    <h1>Hello, {userName}! 
                        <span role="img" aria-label="smiling-emoji" style={{marginLeft: '10px'}}>😊</span>
                    </h1>
                    <p className="subtext">Welcome to your personal health dashboard.</p>
                </div>
                <div className="header-actions">
                     <button className="primary-button new-booking-btn" onClick={() => navigate('/tests')}>
                        Book New Test 🧪
                    </button>
                    <button className="secondary-button logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* --- NEW GRID LAYOUT --- */}
            <main className="dashboard-grid">
                
                {/* 1. UPCOMING BOOKING (Priority 1) - Wide Card on Desktop */}
                <section className="dashboard-card upcoming-card grid-span-2"> 
                    <h2>Your Next Appointment</h2>
                    {upcomingBooking ? (
                        <div className="booking-details">
                            <span className={`status-badge ${upcomingBooking.status === 'Pending Collection' ? 'pending-status' : 'confirmed-status'}`}>
                                {upcomingBooking.status}
                            </span>
                            
                            <h3 className="test-name">{upcomingBooking.items?.[0]?.name || 'Test Package'}</h3>
                            <p className="test-desc">Order ID: **{upcomingBooking.id}**</p>
                            
                            <div className="booking-info">
                                {/* 👇 Access collectionDate via bookingDetails map */}
                                <p>🗓️ **Date:** **{formatDate(upcomingBooking.bookingDetails?.collectionDate)}**</p> 
                                {/* 👇 Access timeSlot via bookingDetails map */}
                                <p>⏰ **Time:** **{upcomingBooking.bookingDetails?.timeSlot}**</p> 
                                <p>🏠 **Location:** Home Collection</p> 
                            </div>
                            
                            <button className="secondary-button cta-button" onClick={() => navigate(`/orders/${upcomingBooking.id}`)}>
                                View Details / Reschedule
                            </button>
                        </div>
                    ) : (
                        <p className="no-data">You have no upcoming appointments. Use the button below to book one now.</p>
                    )}
                </section>

                {/* 2. RECENT REPORT (Priority 2) - Standard Card */}
                <section className="dashboard-card report-card">
                    <h2>Recent Report Ready</h2>
                    {recentReport ? (
                        <div className="report-details">
                             <h3 className="test-name">{recentReport.items?.[0]?.name || 'Test Package'}</h3>
                             <p>Completed On: **{formatDate(recentReport.completedAt || recentReport.collectionDate)}**</p> 
                            
                             <span className={`status-badge complete-status`}>
                                 {recentReport.status}
                             </span>
                            
                             <button 
                                 className="primary-button cta-button"
                                 onClick={handleViewReport} 
                             >
                                 Download Report (PDF) →
                             </button>
                        </div>
                    ) : (
                        <p className="no-data">Your reports will appear here once analysis is complete.</p>
                    )}
                </section>
                
                {/* 3. QUICK LINKS/PROFILE (Priority 3) - Full Width on Mobile/Small Screen */}
                <section className="dashboard-card links-card grid-span-3">
                    <h2>Quick Actions & History</h2>
                    <div className="quick-actions-grid">
                        <button className="secondary-button action-btn" onClick={() => navigate('/orders')}>
                            All Orders ({orders.length})
                        </button>
                        <button className="secondary-button action-btn" onClick={() => navigate('/cart')}>
                            View Cart 🛒
                        </button>
                        <button className="secondary-button action-btn" onClick={() => navigate('/settings')}>
                            Account Settings ⚙️
                        </button>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default DashboardPage;
