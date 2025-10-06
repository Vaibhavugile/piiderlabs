// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
// 👇 Import signOut
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 

const AuthContext = createContext();

/**
 * Custom hook to consume the authentication context.
 * Provides easy access to currentUser, loading state, and logout function.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provides the global authentication state to the application.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch additional user details from Firestore
  const getUserDetails = async (user) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Merge Firebase Auth data with Firestore custom data (e.g., fullName, isAdmin)
        setCurrentUser({ ...user, ...docSnap.data() });
      } else {
        // Fallback for users without a Firestore doc (e.g., first-time Google sign-ins)
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error fetching user details from Firestore:", error);
      setCurrentUser(user); // Fallback to basic user data
    }
  };

  /**
   * Logs out the current user via Firebase Auth.
   * The onAuthStateChanged listener will automatically update currentUser to null.
   */
  const logout = () => {
    // Clear local state immediately for a fast UI update
    setCurrentUser(null); 
    // Call Firebase signOut
    return signOut(auth); 
  };

  useEffect(() => {
    // onAuthStateChanged is the main subscription to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. User is logged in. Fetch custom details asynchronously.
        await getUserDetails(user); 
      } else {
        // 2. User is logged out.
        setCurrentUser(null);
      }
      
      // 3. IMPORTANT: Set loading to false only after all async checks are complete.
      setLoading(false); 
    });

    // Cleanup the subscription when the component unmounts
    return unsubscribe; 
  }, []); 

  const value = {
    currentUser,
    loading,
    logout, // 👈 EXPOSE THE LOGOUT FUNCTION
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
