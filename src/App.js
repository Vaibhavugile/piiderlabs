// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 

// Components
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './pages/HomePage';

// 📋 PAGE IMPORTS
import TestListingPage from './pages/TestListingPage'; 
import TestDetailPage from './pages/TestDetailPage'; 
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage'; 
import OrderConfirmationPage from './pages/OrderConfirmationPage'; // 👈 NEW IMPORT

// Import global styles
import './App.css'; 


// --- ROUTING WRAPPERS ---

/**
 * 1. ProtectedRoute: Guards private pages. Redirects LOGGED OUT users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
      return <div className="loading-state">Loading application...</div>;
  }

  // The Checkout page requires a logged-in user
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * 2. RedirectIfLoggedIn: Guards public entry pages. Redirects LOGGED IN users to the homepage (/).
 */
const RedirectIfLoggedIn = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
      return <div className="loading-state">Loading application...</div>;
  }
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};


// --- PAGES (Placeholder/Functional components) ---

const DashboardPage = () => {
    const { currentUser, logout } = useAuth();
    
    return (
        <div className="dashboard-container">
            <header className="app-header">
                <h1>PiiderLab Dashboard</h1>
                <nav>
                    <button onClick={logout} className="header-button secondary-button">Logout</button>
                </nav>
            </header>
            <div className="dashboard-content">
                <h2>Welcome, {currentUser ? currentUser.fullName || currentUser.email : 'User'}</h2>
                <p>This is your secure Dashboard.</p>
            </div>
        </div>
    );
};
const NotFoundPage = () => <h1 className="not-found">404 | Page Not Found</h1>;


// --- MAIN ROUTING COMPONENT ---

const AppRoutes = () => {
  return (
    <Routes>
      
      {/* Auth pages redirect away if the user is logged in */}
      <Route 
        path="/login" 
        element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} 
      />
      <Route 
        path="/signup" 
        element={<RedirectIfLoggedIn><Signup /></RedirectIfLoggedIn>} 
      />
      
      {/* PUBLIC ROUTES for Test Flow */}
      <Route 
        path="/tests" 
        element={<TestListingPage />} 
      />
      <Route 
        path="/tests/:testId" 
        element={<TestDetailPage />} 
      />
      <Route 
        path="/cart" 
        element={<CartPage />} 
      />

      {/* SECURE ROUTES for Booking/Checkout */}
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } 
      />
      {/* 👇 NEW PROTECTED ROUTE for Order Confirmation */}
      <Route 
        path="/order-confirmation" 
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* The root path ("/") is the homepage */}
      <Route 
        path="/" 
        element={<HomePage />} 
      />
      
      {/* Dashboard is another protected route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
            <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;