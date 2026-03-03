import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, userProfile, isAuthenticated } = useAuth();

  console.log("🔒 AdminRoute Check:");
  console.log("  - isAuthenticated:", isAuthenticated);
  console.log("  - user:", user?.email);
  console.log("  - userProfile:", userProfile);
  console.log("  - role:", userProfile?.role);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // If userProfile is still loading, show loading
  if (!userProfile) {
    console.log("⏳ User profile loading...");
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px' 
    }}>Loading admin dashboard...</div>;
  }

  // If not admin, redirect to home
  if (userProfile.role !== "admin") {
    console.log("❌ Not admin (role: " + userProfile.role + "), redirecting to /");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Admin access granted!");
  // If admin, render the protected component
  return children;
};

export default AdminRoute;
