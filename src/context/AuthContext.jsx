import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // 🔹 Keep user logged in after refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Login (Firebase)
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserProfile(result.user.uid);
    return result;
  };

  // 🔹 Signup (Firebase)
  const signup = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(result.user, { displayName: name });
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      name: name,
      email: email,
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      gender: "",
      country: "",
      language: "English",
      timezone: "",
      phone: "",
      role: "user",
      createdAt: new Date().toISOString()
    });
    
    await fetchUserProfile(result.user.uid);
    return result;
  };

  // 🔹 Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profileData, { merge: true });
      
      // Update display name in Firebase Auth if name changed
      if (profileData.name) {
        await updateProfile(user, { displayName: profileData.name });
      }
      
      await fetchUserProfile(user.uid);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // 🔹 Logout
  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // 🔹 Add isAuthenticated
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      login, 
      signup, 
      logout, 
      isAuthenticated,
      updateUserProfile 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};