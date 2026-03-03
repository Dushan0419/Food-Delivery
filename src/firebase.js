// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9c7WCjjU0NIT0t-akK-OmQkj4muyTZc8",
  authDomain: "fooddeliveryapp-89ffc.firebaseapp.com",
  databaseURL: "https://fooddeliveryapp-89ffc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fooddeliveryapp-89ffc",
  storageBucket: "fooddeliveryapp-89ffc.firebasestorage.app",
  messagingSenderId: "186043314527",
  appId: "1:186043314527:web:fb67020181f8cb09b806ea",
  measurementId: "G-BKQ5LFKQDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);  // ✅ THIS is the fix - db should be Firestore
export const storage = getStorage(app);

export default app;