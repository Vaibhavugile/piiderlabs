import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserOrders, formatDate } from '../utils/orderUtils';
import './OrderHistoryPage.css';

// Helper to determine the badge class based on status
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Report Ready':
            return 'complete';
        case 'Confirmed':
        case 'Pending Collection':
            return 'pending';
        case 'Canceled':
            return 'canceled';
        case 'Processing':
            return 'in-progress';
        default:
            return 'default';
    }
}

// Placeholder for Order Detail Page component
const OrderDetailPage = () => {
    // In a real app, this would use useParams() to get orderId and fetch details.
    return (
        <div className="order-detail-container">
            <h1>Order Details</h1>
            <p>This page will show the full details, items, address, and status history for a specific order ID.</p>
        </div>
    );
};
export { OrderDetailPage }; // Export for use in App.js

const OrderHistoryPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch orders on component mount or user change
    useEffect(() => {
        const loadOrders = async () => {
            if (!currentUser?.uid) {
                // Not authenticated yet, or not using authentication
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Assuming fetchUserOrders is available in '../utils/orderUtils'
                const fetchedOrders = await fetchUserOrders(currentUser.uid);
                
                // Sort by date descending (most recent first) for better UX
                const sortedOrders = fetchedOrders.sort((a, b) => 
                    b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
                );

                setOrders(sortedOrders);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load your order history. Please try again.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [currentUser?.uid]);
    
    // --- Conditional Renders ---
    if (loading) {
        return (
            <div className="order-history-container">
                <div className="loading-state">
                    <h1>Order History</h1>
                    <p>Loading your past bookings...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="order-history-container">
            <header className="order-history-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    &larr; Back to Dashboard
                </button>
                <h1>Your Order History</h1>
                <p>Track the status and view details for all your lab test bookings.</p>
            </header>

            <main>
                {error && <div className="error-state">{error}</div>}

                {orders.length === 0 && !error ? (
                    <div className="no-orders-state">
                        <h3>No Orders Found</h3>
                        <p>It looks like you haven't placed any lab test bookings yet.</p>
                        <button 
                            className="view-details-btn" 
                            onClick={() => navigate('/')}
                        >
                            Start a New Booking
                        </button>
                    </div>
                ) : (
                    // --- NEW CARD LAYOUT (Replaces Table) ---
                    <div className="order-list-grid">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-info">
                                    <h3>
                                        Order ID
                                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </h3>
                                    <p className="order-id">
                                        #{order.id.substring(0, 8)}...
                                    </p>
                                    
                                    <div className="card-details-row">
                                        <span>Order Date:</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="card-details-row">
                                        <span>Collection Date:</span>
                                        <span>{formatDate(order.bookingDetails?.collectionDate)}</span>
                                    </div>
                                    <div className="card-details-row total-price">
                                        <span>Total:</span>
                                        {/* Removed markdown formatting for correct React rendering */}
                                        <span>₹{order.totalPrice?.toFixed(2) || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="view-details-btn" 
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    View Details &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistoryPage;
