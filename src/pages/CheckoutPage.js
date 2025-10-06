// src/pages/CheckoutPage.js

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 👇 NEW IMPORTS for Firebase Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Assumes '../firebase' exports 'db'
// ------------------------------------
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const STEPS = {
  ADDRESS: 1,
  SLOT: 2,
  PAYMENT: 3,
};

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------
  // 1. STATE MANAGEMENT
  // ----------------------------------------------------
  const [step, setStep] = useState(STEPS.ADDRESS);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    // Prefill details from the logged-in user's data 
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || '',

    // Booking specific
    collectionDate: '',
    timeSlot: '', // e.g., '8AM-10AM'
    paymentMethod: 'Pay On Collection', // Default
  });

  const isCartEmpty = cartItems.length === 0;

  // ----------------------------------------------------
  // 2. CORE FUNCTION: Save Order to Firebase
  // ----------------------------------------------------

  const handlePlaceOrder = async () => {
    setError('');
    setIsProcessing(true);

    if (!currentUser?.uid) {
        setError('User not logged in. Please log in to complete your order.');
        setIsProcessing(false);
        return;
    }

    // 1. Construct the Order Object
    // Ensure all required variables (cartItems, totalPrice, bookingDetails, currentUser) 
    // are available in the scope where this function is defined.
    const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
        totalPrice: totalPrice,
        bookingDetails: {
            ...bookingDetails,
            // Format date for better readability/storage
            collectionDate: new Date(bookingDetails.collectionDate).toISOString().split('T')[0],
        },
        // Firebase timestamp for server-side time accuracy
        createdAt: serverTimestamp(), 
        status: 'Pending Collection', // Initial status
    };

    try {
        // 2. Save the order to Firestore's 'orders' collection
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log("Order successfully placed with ID: ", docRef.id);

        // 3. Clear the cart 
        clearCart(); 

        // 4. Navigate to the Order Confirmation Page, passing ALL crucial details via state
        navigate('/order-confirmation', {
            state: {
                orderId: docRef.id,
                totalAmount: orderData.totalPrice, // Pass total price
                
                // Pass combined date/time and all contact/address details
                collectionDetails: `${orderData.bookingDetails.collectionDate} at ${orderData.bookingDetails.timeSlot}`,
                paymentMethod: orderData.bookingDetails.paymentMethod,
                fullName: orderData.bookingDetails.fullName,
                address: orderData.bookingDetails.address,
                pincode: orderData.bookingDetails.pincode,
            },
            replace: true, // Prevents back button from returning to checkout
        });

    } catch (err) {
        console.error('Error placing order:', err);
        setError('Failed to place order. A system error occurred. Please try again.');
    } finally {
        setIsProcessing(false);
    }
};


  // ----------------------------------------------------
  // 3. STEP NAVIGATION LOGIC
  // ----------------------------------------------------

  const handleNext = () => {
    setError('');
    
    if (step === STEPS.ADDRESS) {
      if (!bookingDetails.fullName || !bookingDetails.address || !bookingDetails.pincode || !bookingDetails.mobile) {
        setError('Please fill in all address and contact fields.');
        return;
      }
      setStep(STEPS.SLOT);
    } else if (step === STEPS.SLOT) {
      if (!bookingDetails.collectionDate || !bookingDetails.timeSlot) {
        setError('Please select a collection date and time slot.');
        return;
      }
      setStep(STEPS.PAYMENT);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > STEPS.ADDRESS) {
      setStep(step - 1);
    } else {
      navigate('/cart');
    }
  };

  const handleBookingDetailsChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };


  // ----------------------------------------------------
  // 4. RENDER FUNCTIONS
  // ----------------------------------------------------

  const renderAddressStep = () => (
    <div className="step-content">
      <h2>1. Collection Address</h2>
      <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" value={bookingDetails.fullName} onChange={handleBookingDetailsChange} required />
      </div>
      <div className="input-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input type="tel" id="mobile" name="mobile" value={bookingDetails.mobile} onChange={handleBookingDetailsChange} required />
      </div>
      <div className="input-group">
          <label htmlFor="address">Address (Flat/House No., Street)</label>
          <textarea id="address" name="address" rows="3" value={bookingDetails.address} onChange={handleBookingDetailsChange} required></textarea>
      </div>
      <div className="input-group">
          <label htmlFor="pincode">Pincode</label>
          <input type="text" id="pincode" name="pincode" value={bookingDetails.pincode} onChange={handleBookingDetailsChange} required />
      </div>
      <button className="primary-button" onClick={handleNext}>
        Continue to Slot Selection
      </button>
    </div>
  );

  const renderSlotStep = () => (
    <div className="step-content">
      <h2>2. Select Date & Time Slot</h2>
      <div className="input-group">
          <label htmlFor="collectionDate">Preferred Collection Date</label>
          <input 
            type="date" 
            id="collectionDate" 
            name="collectionDate" 
            value={bookingDetails.collectionDate} 
            onChange={handleBookingDetailsChange} 
            min={new Date().toISOString().split('T')[0]} // Min date is today
            required 
          />
      </div>

      <div className="input-group">
          <label>Preferred Time Slot</label>
          <div className="time-slot-grid">
              {['8AM-10AM', '10AM-12PM', '12PM-2PM', '4PM-6PM'].map(slot => (
                  <button
                      key={slot}
                      type="button"
                      className={`time-slot-button ${bookingDetails.timeSlot === slot ? 'selected' : ''}`}
                      onClick={() => setBookingDetails(p => ({ ...p, timeSlot: slot }))}
                  >
                      {slot}
                  </button>
              ))}
          </div>
      </div>

      <div className="step-actions">
        <button className="secondary-button" onClick={handleBack}>
          ← Back to Address
        </button>
        <button className="primary-button" onClick={handleNext}>
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="step-content">
      <h2>3. Confirm & Pay</h2>
      
      <div className="summary-box">
          <h3>Collection Details</h3>
          <p><strong>Address:</strong> {bookingDetails.address}, Pincode: {bookingDetails.pincode}</p>
          <p><strong>Date:</strong> {new Date(bookingDetails.collectionDate).toDateString()}</p>
          <p><strong>Time Slot:</strong> {bookingDetails.timeSlot}</p>
      </div>

      <div className="cart-summary-checkout">
          <h3>Order Summary</h3>
          <ul className="cart-items-list-summary">
              {cartItems.map(item => (
                  <li key={item.id}>
                    {item.name} x {item.quantity} 
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
              ))}
          </ul>
          <div className="summary-line total-price-line">
              <span>Grand Total:</span>
              <span className="summary-value">₹{totalPrice.toFixed(2)}</span>
          </div>
      </div>
      
      <div className="payment-method-selection">
          <h3>Payment Method</h3>
          <p>You have selected: **Pay On Collection** (Cash or Digital).</p>
      </div>
      
      <div className="step-actions">
        <button className="secondary-button" onClick={handleBack} disabled={isProcessing}>
            ← Back to Slot
        </button>
        <button 
          className="primary-button final-action-button" 
          onClick={handlePlaceOrder} // 👈 CALLS THE FIREBASE FUNCTION
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Order...' : `Place Order & Confirm Booking`}
        </button>
      </div>
    </div>
  );


  const renderStepContent = () => {
    switch (step) {
      case STEPS.ADDRESS:
        return renderAddressStep();
      case STEPS.SLOT:
        return renderSlotStep();
      case STEPS.PAYMENT:
        return renderPaymentStep();
      default:
        return null;
    }
  };


  if (isCartEmpty) {
    return (
      <div className="checkout-container empty-checkout">
        <h1>Checkout</h1>
        <p>Your cart is empty. Please add items to proceed to checkout. 🛒</p>
        <button className="primary-button" onClick={() => navigate('/tests')}>
            Go to Tests
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. MAIN RENDER
  // ----------------------------------------------------

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>Secure Booking</h1>
      </header>

      <div className="steps-indicator">
        <div className={`step-item ${step >= STEPS.ADDRESS ? 'active' : ''}`}>
          <span className="step-number">1</span> Address
        </div>
        <div className={`step-item ${step >= STEPS.SLOT ? 'active' : ''}`}>
          <span className="step-number">2</span> Slot
        </div>
        <div className={`step-item ${step >= STEPS.PAYMENT ? 'active' : ''}`}>
          <span className="step-number">3</span> Payment
        </div>
      </div>

      <div className="checkout-main">
        {error && <div className="error-message">{error}</div>}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CheckoutPage;