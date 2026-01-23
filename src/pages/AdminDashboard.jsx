// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    
    // Show success notification
    setShowLogoutSuccess(true);
    
    // Close sidebar if open
    setSidebarOpen(false);
    
    // Navigate after showing notification
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Logout Success Notification */}
      {showLogoutSuccess && (
        <div className="logout-success-notification">
          <div className="logout-success-content">
            <div className="logout-success-icon">✓</div>
            <div className="logout-success-message">
              <h3>Logged Out Successfully</h3>
              <p>You have been securely logged out. Redirecting to home page...</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-dashboard-split">
        {/* Left Side - Image/Logo Section */}
        <div className="admin-dashboard-left">
          <div className="admin-dashboard-image-container">
            {/* You can use the same image as login or a different one */}
            <img 
              src="adminBuilding.jpg" 
              alt="Nueva Vizcaya State University Campus" 
              className="admin-dashboard-image"
            />
            <div className="admin-dashboard-overlay">
              {/* Logo */}
              <div className="admin-dashboard-logo-container">
                <img 
                  src="nvsu-logo.png" // Your logo here
                  alt="Nueva Vizcaya State University Logo"
                  className="admin-dashboard-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    document.querySelector('.admin-logo-fallback').style.display = 'block';
                  }}
                />
                {/* Fallback text if logo doesn't load */}
                <div className="admin-logo-fallback">
                  <div className="nvsu-logo-text">
                    <span className="nvsu-n">N</span>
                    <span className="nvsu-v">V</span>
                    <span className="nvsu-s">S</span>
                    <span className="nvsu-u">U</span>
                  </div>
                </div>
              </div>
              
              <h2>Nueva Vizcaya State University</h2>
              <p className="admin-dashboard-subtitle">
                Administrative Dashboard
              </p>
              
              <div className="admin-dashboard-note">
                <span className="admin-note-icon">⚙️</span>
                <span>System Management & Control Panel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Admin Content */}
        <div className="admin-dashboard-right">
          {/* Header with Menu Toggle */}
          <div className="admin-dashboard-header">
            <button className="admin-menu-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <h1>Admin Dashboard</h1>
          </div>

          {/* Main Content Area */}
          <div className="admin-main-content">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
              <div className="admin-sidebar-content">
                <h2>Admin Panel</h2>
                <nav>
                  <ul>
                    <li>
                      <Link to="/admin/services" onClick={() => setSidebarOpen(false)}>
                        <span className="admin-icon">📋</span>
                        <span>Manage Services</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/users" onClick={() => setSidebarOpen(false)}>
                        <span className="admin-icon">👥</span>
                        <span>Manage Users</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/manage-carousel" onClick={() => setSidebarOpen(false)}>
                        <span className="admin-icon">🖼️</span>
                        <span>Manage Carousel</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/feedback" onClick={() => setSidebarOpen(false)}>
                        <span className="admin-icon">💬</span>
                        <span>View Feedback</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Logout Button */}
              <div className="admin-sidebar-footer">
                <button className="admin-logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  Logout
                </button>
              </div>
            </aside>

            {/* Content Area */}
            <div className="admin-content-area">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
