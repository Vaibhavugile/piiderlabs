// src/firebase.js

import { initializeApp } from "firebase/app";
// Import GoogleAuthProvider along with getAuth
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

// Your PiiderLab Firebase CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBmeU2_tCAmhMlsZ3laAvwM6R1J309Y0hk",
  authDomain: "pidr-c644e.firebaseapp.com",
  projectId: "pidr-c644e",
  storageBucket: "pidr-c644e.firebasestorage.app",
  messagingSenderId: "344167777219",
  appId: "1:344167777219:web:a12bdbe8dbc5efab1e7376",
  measurementId: "G-PGRBXP6XK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize and export the Google Provider for easy use in components
export const googleProvider = new GoogleAuthProvider(); 
