import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrderById, formatDate } from '../utils/orderUtils';
import './OrderDetailPage.css';

// Helper to determine the badge color based on status (reused from OrderHistoryPage)
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

const OrderDetailPage = () => {
    // 1. Get the order ID from the URL
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // 2. State for data
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Fetch Order Data
    useEffect(() => {
        const loadOrder = async () => {
            if (!currentUser?.uid || !orderId) {
                // Should be caught by ProtectedRoute, but good check
                navigate('/login');
                return;
            }
            setLoading(true);
            try {
                const fetchedOrder = await fetchOrderById(orderId);
                
                // Security check: Ensure the order belongs to the current user
                if (fetchedOrder && fetchedOrder.userId !== currentUser.uid) {
                    setError("Access Denied: This order does not belong to your account.");
                    setOrder(null);
                    return;
                }
                
                setOrder(fetchedOrder);
            } catch (err) {
                console.error("Failed to load order:", err);
                setError(err.message || "An unexpected error occurred while loading order details.");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId, currentUser?.uid, navigate]);

    // Convenient access to nested data
    const booking = order?.bookingDetails;
    
    // --- Conditional Renders ---
    if (loading) {
        return (
            <div className="order-detail-container">
                <div className="loading-state">Loading Order <strong>{orderId}</strong> details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-container">
                <div className="error-state">
                    <button className="back-button" onClick={() => navigate('/orders')}>← Back to History</button>
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="order-detail-container">
                <div className="not-found-state">
                    <button className="back-button" onClick={() => navigate('/orders')}>← Back to History</button>
                    <h3>Order Not Found</h3>
                    <p>The order ID <strong>{orderId}</strong> could not be located.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="order-detail-container">
            <header className="order-detail-header">
                <button className="back-button" onClick={() => navigate('/orders')}>
                    &larr; Back to Order History
                </button>
                <div className="header-details">
                    <h1>Order Details: <strong>{order.id.substring(0, 8)}</strong>...</h1>
                    <p>Placed on <strong>{formatDate(order.createdAt)}</strong></p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                </span>
            </header>

            <main className="order-detail-grid">
                
                {/* 1. BOOKING & COLLECTION DETAILS */}
                <section className="detail-card booking-card">
                    <h2>Appointment & Collection</h2>
                    <div className="detail-group">
                        <p>🗓️ <strong>Collection Date:</strong> <strong>{formatDate(booking?.collectionDate)}</strong></p>
                        <p>⏰ <strong>Time Slot:</strong> <strong>{booking?.timeSlot}</strong></p>
                        <p>📍 <strong>Service Type:</strong> Home Collection</p>
                    </div>
                    
                    <div className="detail-group">
                        <h3>Collection Address</h3>
                        {/* Removed ** asterisks and used <strong> */}
                        <p><strong>{booking?.fullName}</strong></p> 
                        <p>{booking?.address}</p>
                        <p>Pincode: <strong>{booking?.pincode}</strong></p>
                        <p>Mobile: <strong>{booking?.mobile}</strong></p>
                        {/* Added a margin to separate the button visually from the address */}
                        <button 
                            className="secondary-button reschedule-btn"
                            onClick={() => console.log('Simulating Reschedule for:', order.id)}
                            disabled={order.status !== 'Confirmed' && order.status !== 'Pending Collection'}
                        >
                            Reschedule Appointment
                        </button>
                    </div>
                </section>

                {/* 2. ORDER SUMMARY & ITEMS */}
                <section className="detail-card summary-card">
                    <h2>Test Summary</h2>
                    <div className="item-list">
                        {order.items?.map((item, index) => (
                            <div key={index} className="item-row">
                                <span className="item-name"><strong>{item.name}</strong></span>
                                <span className="item-quantity">Qty: {item.quantity}</span>
                                <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="price-breakdown">
                        <p><span>Subtotal:</span> <span>₹{order.totalPrice?.toFixed(2)}</span></p>
                        <p><span>Discount:</span> <span>₹0.00</span></p>
                        <p className="total-row"><span>TOTAL PAID:</span> <span>₹{order.totalPrice?.toFixed(2)}</span></p>
                        <p className="payment-method">Payment Method: <strong>{booking?.paymentMethod}</strong></p>
                    </div>

                    {order.status === 'Report Ready' && (
                        <button className="primary-button download-btn">
                            Download Report (PDF) &darr;
                        </button>
                    )}
                </section>

            </main>
        </div>
    );
};

export default OrderDetailPage;
