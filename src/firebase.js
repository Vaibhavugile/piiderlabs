// src/firebase.js

import { initializeApp } from "firebase/app";
// Import GoogleAuthProvider along with getAuth
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

// Your PiiderLab Firebase CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyD360ivgc7a3T1OffprpgOxx4BlK26Jnbs",
  authDomain: "pidr-7dbe8.firebaseapp.com",
  projectId: "pidr-7dbe8",
  storageBucket: "pidr-7dbe8.firebasestorage.app",
  messagingSenderId: "324014919259",
  appId: "1:324014919259:web:38c7f1360ca3234f65f97e",
  measurementId: "G-X3ENZSR74S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize and export the Google Provider for easy use in components
export const googleProvider = new GoogleAuthProvider(); 
