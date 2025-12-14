// src/components/NavBar.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in and get email
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

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("justLoggedIn");
    
    setIsLoggedIn(false);
    setUserEmail("");
    setShowLogoutSuccess(true);
    setMenuOpen(false);
    
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  // Format email to show just the name part
  const getDisplayName = (email) => {
    if (!email) return "";
    const namePart = email.split('@')[0];
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
          {/* About Button with Background Color */}
          <Link to="/about" className="about-btn" onClick={closeMenu}>
            About
          </Link>
          
          {/* User Email Display */}
          {isLoggedIn && userEmail && (
            <div className="user-email-nav" title={`Logged in as: ${userEmail}`}>
              <i className="fas fa-user-circle"></i>
              <span>{getDisplayName(userEmail)}</span>
            </div>
          )}

          {/* Logout Button with Centered Text */}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
