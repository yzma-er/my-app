// src/components/NavBar.jsx - UPDATED VERSION
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState(""); // Add state for user email
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  // 🧩 Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Check if user is logged in and get email
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    } else {
      setIsLoggedIn(false);
      setUserEmail("");
    }
  }, []);

  // ✅ MATCHES AdminDashboard logout behavior with success message
  const handleLogout = () => {
    // ✅ Clear all user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("justLoggedIn");
    
    // Update state
    setIsLoggedIn(false);
    setUserEmail("");
    
    // Show success notification
    setShowLogoutSuccess(true);
    
    // Close mobile menu if open
    setMenuOpen(false);
    
    // Navigate after showing notification
    setTimeout(() => {
      navigate("/");   // ⬅ Sends user back to Role Selection page
    }, 2000); // Show notification for 2 seconds before redirect
  };

  // ✅ Format email to show just the name part
  const getDisplayName = (email) => {
    if (!email) return "";
    const namePart = email.split('@')[0];
    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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

      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-left">
          <h2 className="navbar-logo">ASP Digital Guidance</h2>
        </div>

        {/* Hamburger icon */}
        <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <Link to="/about" onClick={closeMenu}>About</Link>
          
          {/* ✅ Show user email if logged in */}
          {isLoggedIn && userEmail && (
            <div className="user-email-nav" title={`Logged in as: ${userEmail}`}>
              <i className="fas fa-user-circle"></i>
              <span>{getDisplayName(userEmail)}</span>
            </div>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
