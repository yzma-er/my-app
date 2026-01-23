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

      <div className="admin-dashboard-fullscreen">
        {/* Full Screen Background Image */}
        <div className="admin-fullscreen-bg">
          <img 
            src="adminBuilding.jpg" 
            alt="Nueva Vizcaya State University Campus" 
            className="admin-fullscreen-image"
          />
          <div className="admin-fullscreen-overlay">
            {/* Logo and Branding */}
            <div className="admin-fullscreen-logo-container">
              <img 
                src="nvsu-logo.png" // Your logo here
                alt="Nueva Vizcaya State University Logo"
                className="admin-fullscreen-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  document.querySelector('.admin-fullscreen-logo-fallback').style.display = 'block';
                }}
              />
              {/* Fallback text if logo doesn't load */}
              <div className="admin-fullscreen-logo-fallback">
                <div className="nvsu-logo-text">
                  <span className="nvsu-n">N</span>
                  <span className="nvsu-v">V</span>
                  <span className="nvsu-s">S</span>
                  <span className="nvsu-u">U</span>
                </div>
              </div>
            </div>
            
            <h1>Nueva Vizcaya State University</h1>
            <p className="admin-fullscreen-subtitle">
              Administrative Dashboard
            </p>
            
           
          </div>
        </div>

        {/* Menu Toggle */}
        <button className="admin-fullscreen-menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
          <span className="menu-toggle-text">Menu</span>
        </button>

        {/* Sidebar */}
        <aside className={`admin-fullscreen-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="admin-fullscreen-sidebar-content">
            <div className="sidebar-header">
              <h2>Admin Panel</h2>
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
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

            {/* Logout Button */}
            <div className="admin-fullscreen-sidebar-footer">
              <button className="admin-fullscreen-logout-btn" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Directly on the image */}
        <div className="admin-fullscreen-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
