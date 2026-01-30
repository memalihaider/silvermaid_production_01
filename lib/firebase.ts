// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Optional: agar authentication chahiye

const firebaseConfig = {
  apiKey: "AIzaSyDU9KZ3r-HtwjcQOxwCFSveprrBk1Mf8lA",
  authDomain: "homework-a36e3.firebaseapp.com",
  projectId: "homework-a36e3",
  storageBucket: "homework-a36e3.firebasestorage.app",
  messagingSenderId: "476483591829",
  appId: "1:476483591829:web:336c9ccbb7e23d0049459c",
  measurementId: "G-NTCTYB9HVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // Firestore export karein
export const auth = getAuth(app); // Optional