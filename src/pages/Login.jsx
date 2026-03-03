import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthFigma.css';
import loginBg from '../assets/icons/login-bg.jpg';
import GoogleIcon from '../assets/icons/google-icon-logo.svg';
import AppleIcon from '../assets/icons/apple-logo.svg';
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login with Firebase Auth
      const userCredential = await login(formData.email, formData.password);
      const user = userCredential.user;

      console.log("🔐 Logged in user:", user.email);
      console.log("🔐 User UID:", user.uid);

      // 2. Get user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "user"; // Default role

      if (userSnap.exists()) {
        // User document exists
        const userData = userSnap.data();
        console.log("👤 User data:", userData);
        role = userData.role || "user";
      } else {
        // User document doesn't exist - create it (first time login from web)
        console.log("⚠️ User document not found, creating new one...");
        
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          userId: user.uid,
          role: "user", // Default role for new users
          wallet: "0",
          profileImage: user.photoURL || "",
          createdAt: new Date().toISOString()
        });
        
        role = "user";
      }

      console.log("🎭 User role:", role);

      // 3. Redirect based on role
      if (role === "admin") {
        console.log("✅ Admin detected, redirecting to /admindashboard");
        navigate("/admindashboard");
      } else {
        console.log("✅ Regular user, redirecting to home");
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      
      // error messages
      let errorMessage = "Failed to login";
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-figma-container">
      {/* Left Side - Background Image */}
      <div className="auth-figma-left">
        <div className="bg-overlay"></div>
        <img src={loginBg} alt="Background" className="auth-bg-image" />
      </div>

      {/* Right Side - Form */}
      <div className="auth-figma-right">
        <div className="auth-figma-header">
          <div className="language-dropdown">
            <span>English (United States)</span>
          </div>
          <div className="signup-text">
            Don't have an account? <Link to="/signup" className="signup-btn">Sign up</Link>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="avatar-circle-figma"></div>

          <h2 className="auth-title-figma">Login to your account</h2>
          <p className="auth-subtitle-figma">
            Welcome back! Please enter your credentials to access your account.
          </p>

          {error && <div className="error-msg-figma">{error}</div>}

          <form onSubmit={handleSubmit} className="form-figma">
            <div className="input-group-figma">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group-figma">
              <label htmlFor="password">
                Password
                <button
                  type="button"
                  className="hide-show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                By logging in, I agree to our <a href="#">Terms of use</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="login-btn-figma" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="divider-or">
            <span>OR</span>
          </div>

          <div className="social-btns">
            <button type="button" className="social-btn-figma google">
              <img src={GoogleIcon} alt="Google" className="social-logo" />
              Continue with Google
            </button>
          
            <button type="button" className="social-btn-figma apple">
              <img src={AppleIcon} alt="Apple" className="social-logo" />
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;