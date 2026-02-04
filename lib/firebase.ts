// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage' // Add this


const firebaseConfig = {
  apiKey: "AIzaSyDU9KZ3r-HtwjcQOxwCFSveprrBk1Mf8lA",
  authDomain: "homework-a36e3.firebaseapp.com",
  projectId: "homework-a36e3",
  storageBucket: "homework-a36e3.firebasestorage.app",
  messagingSenderId: "476483591829",
  appId: "1:476483591829:web:336c9ccbb7e23d0049459a",
  measurementId: "G-NTCTYB9HVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app) // Add this export

// Analytics ko conditionally initialize karein
let analytics;
if (typeof window !== "undefined") {
  // Check if we're in the browser
  analytics = getAnalytics(app);
}
export { analytics };