// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyANdFcMHj29Ay3Rpe21TVceFGVf_cKkDjs",
  authDomain: "silvermaid-94246.firebaseapp.com",
  projectId: "silvermaid-94246",
  storageBucket: "silvermaid-94246.firebasestorage.app",
  messagingSenderId: "498436955384",
  appId: "1:498436955384:web:31281713acd4bfeeaaef0d",
  measurementId: "G-3Q8ETHGW7X"
};
// ✅ SINGLETON PATTERN: Sirf ek hi baar initialize karein
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ Analytics ke liye better handling
let analytics;
if (typeof window !== "undefined") {
  // Only initialize if in browser AND Firebase Analytics is supported
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
export { analytics };

