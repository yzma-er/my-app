// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Home } from "lucide-react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Close sidebar when clicking on a link (for mobile)
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Logout Success Notification */}
      {showLogoutSuccess && (
        <div className="logout-success-notification">
          <div className="logout-success-content">
            <div className="logout-success-icon">✓</div>
            <div className="logout-success-message">
              <h3>Logged Out Successfully</h3>
              <p>Redirecting to home page...</p>
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
            {/* Logo and Branding - Simplified on mobile */}
            <div className="admin-fullscreen-logo-container">
              <img 
                src="nvsu-logo.png"
                alt="Nueva Vizcaya State University Logo"
                className="admin-fullscreen-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  document.querySelector('.admin-fullscreen-logo-fallback').style.display = 'block';
                }}
              />
              <div className="admin-fullscreen-logo-fallback">
                <div className="nvsu-logo-text">
                  <span className="nvsu-n">N</span>
                  <span className="nvsu-v">V</span>
                  <span className="nvsu-s">S</span>
                  <span className="nvsu-u">U</span>
                </div>
              </div>
            </div>
            
            <h1 className="admin-fullscreen-title">Nueva Vizcaya State University</h1>
            <p className="admin-fullscreen-subtitle">
              Administrative Dashboard
            </p>
            
            <div className="admin-fullscreen-note">
              <span className="admin-fullscreen-icon">⚙️</span>
              <span>System Management Panel</span>
            </div>

            {/* Mobile Quick Actions */}
            {isMobile && (
              <div className="mobile-quick-actions">
                <button 
                  className="mobile-home-btn"
                  onClick={() => navigate("/")}
                >
                  <Home size={20} />
                  <span>Home</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Bar */}
        {isMobile && (
          <div className="mobile-header">
            <div className="mobile-header-left">
              <button 
                className="mobile-menu-btn"
                onClick={toggleSidebar}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <span className="mobile-header-title">Admin Dashboard</span>
            </div>
            <button 
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              <span className="logout-icon">🚪</span>
            </button>
          </div>
        )}

        {/* Desktop Menu Toggle */}
        {!isMobile && (
          <button className="admin-fullscreen-menu-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="menu-toggle-text">Menu</span>
          </button>
        )}

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
                  <Link to="/admin/services" onClick={handleNavClick}>
                    <span className="admin-icon">📋</span>
                    <span>Manage Services</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" onClick={handleNavClick}>
                    <span className="admin-icon">👥</span>
                    <span>Manage Users</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/manage-carousel" onClick={handleNavClick}>
                    <span className="admin-icon">🖼️</span>
                    <span>Manage Carousel</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/feedback" onClick={handleNavClick}>
                    <span className="admin-icon">💬</span>
                    <span>View Feedback</span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Logout Button - Hidden on mobile (in header) */}
            {!isMobile && (
              <div className="admin-fullscreen-sidebar-footer">
                <button className="admin-fullscreen-logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area - Adjusted for mobile */}
        <div className="admin-fullscreen-content">
          <Outlet />
        </div>

        {/* Mobile Navigation Bar */}
        {isMobile && (
          <div className="mobile-bottom-nav">
            <button 
              className="mobile-nav-item"
              onClick={() => navigate("/")}
            >
              <Home size={22} />
              <span>Home</span>
            </button>
            <button 
              className="mobile-nav-item active"
              onClick={toggleSidebar}
            >
              <Menu size={22} />
              <span>Menu</span>
            </button>
            <button 
              className="mobile-nav-item"
              onClick={handleLogout}
            >
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;
