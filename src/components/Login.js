// src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { auth, googleProvider, db } from '../firebase';
import './AuthForm.css'; 

// Helper function to create/fetch the Firestore user document
const createUserDocumentIfMissing = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // Document does not exist, create it (CRUCIAL for new Google Sign-in users)
        await setDoc(userRef, {
            fullName: user.displayName || user.email.split('@')[0], 
            email: user.email,
            mobile: '',
            createdAt: new Date(),
            isAdmin: false,
        }, { merge: true });
        // 👇 CONSOLE LOG FOR NEW GOOGLE USER DOCUMENT CREATION
        console.log("SUCCESS: Firestore user document created for new Google sign-in.");
        return true;
    }
    return false;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to wait for the Firebase Auth state change to propagate
  const waitForAuthState = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 👇 CONSOLE LOG FOR EMAIL/PASSWORD SUCCESS
      console.log(`SUCCESS: User ${result.user.email} logged in via Email/Password.`);

      await createUserDocumentIfMissing(result.user); 
      
      // Wait for AuthContext to detect and update
      await waitForAuthState(); 
      
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      // 👇 CONSOLE LOG FOR FAILURE
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider); 
      
      // 👇 CONSOLE LOG FOR GOOGLE AUTH SUCCESS
      console.log(`SUCCESS: User ${result.user.email} logged in via Google.`);

      // Create the Firestore document after successful Google Auth
      await createUserDocumentIfMissing(result.user); 
      
      // Wait for AuthContext to detect and update
      await waitForAuthState(); 

    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
          setError('Failed to sign in with Google. Please try again.');
          // 👇 CONSOLE LOG FOR GOOGLE FAILURE
          console.error("Google login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card fade-in">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to access your bookings and reports.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@piiderlab.com"
              required
              autocomplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autocomplete="current-password" 
            />
            <button type="button" className="forgot-password">Forgot Password?</button>
          </div>

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>

        <button onClick={handleGoogleLogin} className="google-button" disabled={isLoading}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_google_g_standard.png" alt="G" className="google-icon" /> 
          Continue with Google
        </button>

        <p className="switch-link">
          Don't have an account? <span onClick={() => navigate('/signup')}>Create Account</span>
        </p>
      </div>
    </div>
  );
};

export default Login;