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

      <div className="admin-dashboard">
        {/* Main Content (left side with background image) */}
        <main className="main-content" style={{ 
          flex: 1,
          backgroundImage: `url(${process.env.PUBLIC_URL + '/images/adminBuilding.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right', // Align to right to match sidebar
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}>
          {/* Overlay for better text readability */}
          <div className="content-overlay">
            <Outlet />
          </div>
        </main>

        {/* Sidebar (right side) */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-content">
            <h2>Admin Panel</h2>
            <nav>
              <ul>
                <li>
                  <Link to="/admin/services" onClick={() => setSidebarOpen(false)}>
                    Manage Services
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" onClick={() => setSidebarOpen(false)}>
                    Manage Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/manage-carousel" onClick={() => setSidebarOpen(false)}>
                    Manage Carousel
                  </Link>
                </li>
                <li>
                  <Link to="/admin/feedback" onClick={() => setSidebarOpen(false)}>
                    View Feedback
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Logout always visible at bottom */}
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        {/* Menu toggle for mobile - now on right side */}
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </>
  );
}

export default AdminDashboard;
