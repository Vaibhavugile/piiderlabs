// src/components/Signup.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthForm.css';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to wait for the Firebase Auth state change to propagate
  const waitForAuthState = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 👇 CONSOLE LOG FOR AUTH SUCCESS
      console.log(`SUCCESS: Firebase Auth user created with UID: ${user.uid}`);

      // 2. Create a corresponding user document in Firestore (for profile data)
      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        mobile: '', 
        createdAt: new Date(),
        isAdmin: false, 
      });

      // 👇 CONSOLE LOG FOR FIRESTORE SUCCESS
      console.log(`SUCCESS: Firestore document created for user: ${fullName}`);

      // Wait briefly to ensure the onAuthStateChanged listener in AuthContext fires and completes
      await waitForAuthState(); 

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else {
        setError('Account creation failed. Please try again.');
      }
      // 👇 CONSOLE LOG FOR FAILURE
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card fade-in">
        <h2>Create Account</h2>
        <p className="subtitle">Start booking your home lab tests today.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autocomplete="name"
            />
          </div>

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
              placeholder="Min. 6 characters"
              required
              autocomplete="new-password" 
            />
          </div>

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;