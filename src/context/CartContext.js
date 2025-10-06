// src/context/CartContext.js

import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

/**
 * Custom hook to consume the cart context.
 * Provides easy access to cart state and modification functions.
 */
export const useCart = () => useContext(CartContext);

/**
 * CartProvider manages the global state of the shopping cart.
 */
export const CartProvider = ({ children }) => {
  // cartItems is an array of objects: [{ id, name, price, quantity }, ...]
  const [cartItems, setCartItems] = useState([]);

  // Function to add or update an item in the cart
  const addItem = (itemToAdd) => {
    setCartItems(prevItems => {
      // Check if the item already exists in the cart
      const existingItemIndex = prevItems.findIndex(
        item => item.id === itemToAdd.id
      );

      if (existingItemIndex > -1) {
        // Item exists: increase its quantity
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Item does not exist: add it with quantity 1
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  // Function to remove one unit or the whole item
  const removeItem = (itemId) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === itemId);

      if (existingItemIndex === -1) {
        return prevItems; // Item not found
      }

      const item = prevItems[existingItemIndex];

      if (item.quantity === 1) {
        // Quantity is 1: remove the item entirely
        return prevItems.filter(item => item.id !== itemId);
      } else {
        // Quantity is > 1: decrease quantity by 1
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  // Function to clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Memoize calculated values for performance (only recalculate when cartItems changes)
  const cartTotals = useMemo(() => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return { totalItems, totalPrice };
  }, [cartItems]);


  const value = {
    cartItems,
    addItem,
    removeItem,
    clearCart,
    ...cartTotals, // Expose totalItems and totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};