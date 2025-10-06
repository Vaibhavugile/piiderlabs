// src/pages/OrderConfirmationPage.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmationPage.css'; 

const OrderConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // State to hold and format the data
  const [orderInfo, setOrderInfo] = useState({
      orderId: 'N/A',
      totalAmount: 'N/A',
      collectionDetails: 'N/A',
      paymentMethod: 'N/A',
      fullName: 'N/A',      // <-- NEW: Full Name
      address: 'N/A',       // <-- NEW: Address
      pincode: 'N/A',       // <-- NEW: Pincode
      orderPlaced: false,
  });

  useEffect(() => {
      // Check if state data exists (i.e., user came from successful checkout)
      if (state && state.orderId) {
          setOrderInfo({
              orderId: state.orderId,
              // Format total price to two decimal places
              totalAmount: state.totalAmount?.toFixed(2) || 'N/A', 
              collectionDetails: state.collectionDetails,
              paymentMethod: state.paymentMethod,
              
              // Read new booking details fields
              fullName: state.fullName,
              address: state.address,
              pincode: state.pincode,
              
              orderPlaced: true,
          });
      }
      // Depend on 'state' to run only when location state changes
  }, [state]);

  // If the user tries to navigate here directly, redirect them to the home page
  if (!orderInfo.orderPlaced) {
    return (
        <div className="confirmation-container">
            <div className="confirmation-card error-card">
                <h1>⚠️ Access Denied</h1>
                <p>This page cannot be accessed directly. Please complete a checkout process.</p>
                <button className="primary-button" onClick={() => navigate('/tests')}>
                    Go to Tests
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <span className="success-icon">✅</span>
        <h1>Booking Confirmed!</h1>
        <p className="sub-title">Thank you for choosing PiiderLab. Your health is our priority.</p>

        <div className="order-details-summary">
            {/* Display General Order Info */}
            <div className="detail-line">
                <strong>Order ID:</strong>
                <span>#{orderInfo.orderId.toUpperCase().slice(0, 10)}</span>
            </div>

            {/* Display Complete Booking Details */}
            <h3 className="section-heading">Collection Details</h3>
            
            <div className="detail-line">
                <strong>Collection Slot:</strong>
                <span>{orderInfo.collectionDetails}</span>
            </div>
            <div className="detail-line">
                <strong>Collected By:</strong>
                <span>{orderInfo.fullName}</span>
            </div>
            <div className="detail-line address-line">
                <strong>Address:</strong>
                {/* Combine address and pincode for display */}
                <span>{orderInfo.address}, {orderInfo.pincode}</span> 
            </div>
            <div className="detail-line">
                <strong>Payment Method:</strong>
                <span>{orderInfo.paymentMethod}</span>
            </div>

            {/* Display Total Amount */}
            <div className="detail-line total-line">
                <strong>Total Amount:</strong>
                <span className="total-value">₹{orderInfo.totalAmount}</span>
            </div>
        </div>

        <p className="instructions">
          You will receive an SMS and Email confirmation shortly. Our phlebotomist will arrive during the selected slot.
        </p>

        <div className="confirmation-actions">
          <button className="primary-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button className="secondary-button" onClick={() => navigate('/dashboard')}>
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;