import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const { user, userProfile, isAuthenticated, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    country: "",
    language: "English",
    timezone: "",
    phone: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

 

  // Populate form data when userProfile loads or editing starts
  React.useEffect(() => {
    if (userProfile && isEditing) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        gender: userProfile.gender || "",
        country: userProfile.country || "",
        language: userProfile.language || "English",
        timezone: userProfile.timezone || "",
        phone: userProfile.phone || ""
      });
    }
  }, [userProfile, isEditing]);

   if (!isAuthenticated) return <Navigate to="/login" />;

  // Sidebar navigation handler
  const handleNav = (path) => {
    navigate(path);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await updateUserProfile({
        name: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        country: formData.country,
        language: formData.language,
        timezone: formData.timezone,
        phone: formData.phone
      });
      
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile. Please try again.");
    }
    
    setSaving(false);
  };

  const displayName = userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">■ ■</div>

        <nav className="sidebar-menu">
          <button 
            className={location.pathname === "/dashboard" ? "active" : ""} 
            onClick={() => handleNav("/dashboard")}>
            ▦
          </button>
          <button 
            className={location.pathname === "/tasks" ? "active" : ""} 
            onClick={() => handleNav("/tasks")}>
            ◷
          </button>
          <button 
            className={location.pathname === "/achievements" ? "active" : ""} 
            onClick={() => handleNav("/achievements")}>
            🏅
          </button>
          <button 
            className={location.pathname === "/messages" ? "active" : ""} 
            onClick={() => handleNav("/messages")}>
            💬
          </button>
          <button 
            className={location.pathname === "/settings" ? "active" : ""} 
            onClick={() => handleNav("/settings")}>
            ⚙️
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* HEADER */}
        <div className="dashboard-header">
          <h1>Welcome, {displayName.split(" ")[0]}</h1>
          <p>{new Date().toDateString()}</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="profile-wrapper">
          <div className="profile-cover"></div>
          <div className="profile-card">
            {/* TOP */}
            <div className="profile-top">
              <div className="avatar-block">
                <img
                  src={user?.photoURL || "https://via.placeholder.com/90"}
                  alt="avatar"
                />
                <div>
                  <h2>{displayName}</h2>
                  <span>{displayEmail}</span>
                </div>
              </div>

              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="cancel-btn" onClick={handleEditToggle} disabled={saving}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit-btn" onClick={handleEditToggle}>
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* PERSONAL INFO */}
            <section>
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div>
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={isEditing ? formData.firstName : (userProfile?.firstName || "")}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={isEditing ? formData.lastName : (userProfile?.lastName || "")}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label>Gender</label>
                  {isEditing ? (
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input value={userProfile?.gender || ""} disabled />
                  )}
                </div>
                <div>
                  <label>Country</label>
                  <input
                    name="country"
                    value={isEditing ? formData.country : (userProfile?.country || "")}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label>Language</label>
                  <input
                    name="language"
                    value={isEditing ? formData.language : (userProfile?.language || "English")}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label>Time Zone</label>
                  <input
                    name="timezone"
                    value={isEditing ? formData.timezone : (userProfile?.timezone || "")}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </section>

            {/* EMAIL */}
            <section className="email-section">
              <h3>My Email Address</h3>
              <div className="email-box">
                <div className="email-icon">@</div>
                <div>
                  <strong>{displayEmail}</strong>
                  <span>
                    {user?.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
              <button className="add-email">+ Add Email Address</button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;