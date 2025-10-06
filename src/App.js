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
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import DashboardPage from './pages/DashboardPage'; 

// 🆕 NEW ORDER PAGES
import OrderHistoryPage from './pages/OrderHistoryPage'; 
import OrderDetailPage from './pages/OrderDetailPage'; // ⬅️ Corrected: Direct import from its own file

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
 * 2. RedirectIfLoggedIn: Guards public entry pages. Redirects LOGGED IN users to the dashboard.
 */
const RedirectIfLoggedIn = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
      return <div className="loading-state">Loading application...</div>;
  }
  
  if (currentUser) {
    // If logged in, redirect to the Dashboard
    return <Navigate to="/dashboard" replace />; 
  }
  return children;
};


// --- PAGES (Functional components) ---

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

      {/* SECURE ROUTES for Booking/Checkout and History */}
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/order-confirmation" 
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Dashboard is a protected route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      {/* 🆕 ORDER HISTORY ROUTES */}
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/:orderId" 
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } 
      />
      {/* TODO: Add a /reports/:reportId route for report viewing */}

      
      {/* The root path ("/") is the homepage */}
      <Route 
        path="/" 
        element={<HomePage />} 
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
