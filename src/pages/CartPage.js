// src/pages/CartPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import './CartPage.css'; 

const CartPage = () => {
  // Destructure cart state and modifier functions
  const { cartItems, totalItems, totalPrice, removeItem, clearCart, addItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Your Shopping Cart ({totalItems} Items)</h1>
      </header>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty! Time to explore our health packages. 🚀</p>
          <button className="primary-button" onClick={() => navigate('/tests')}>
            Start Booking Tests
          </button>
        </div>
      ) : (
        <div className="cart-content">
            <div className="cart-items-list">
                {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-details">
                            <h2>{item.name}</h2>
                            <p>Price: ₹{item.price.toFixed(2)} | Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="item-quantity-controls">
                            {/* Remove button: decreases quantity or removes item */}
                            <button onClick={() => removeItem(item.id)} disabled={item.quantity === 0}>–</button>
                            <span>{item.quantity}</span>
                            {/* Add button: increases quantity */}
                            <button onClick={() => addItem(item)}>+</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="cart-summary">
                <h2>Cart Summary</h2>
                <div className="summary-line">
                    <span>Total Tests:</span>
                    <span className="summary-value">{totalItems}</span>
                </div>
                <div className="summary-line total-price-line">
                    <span>Grand Total:</span>
                    <span className="summary-value">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                {/* This will be the next step in the booking flow */}
                <button 
                    className="primary-button checkout-button" 
                    onClick={() => navigate('/checkout')}
                >
                    Proceed to Checkout
                </button>
                <button className="secondary-button clear-cart-button" onClick={clearCart}>
                    Clear Cart
                </button>
            </div>
        </div>
      )}
      
      <div className="back-link">
        <span onClick={() => navigate('/tests')}>← Continue Shopping</span>
      </div>
    </div>
  );
};

export default CartPage;