// src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  // 🧩 Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ MATCHES AdminDashboard logout behavior with success message
  const handleLogout = () => {
    localStorage.removeItem("token");
    
    // Show success notification
    setShowLogoutSuccess(true);
    
    // Close mobile menu if open
    setMenuOpen(false);
    
    // Navigate after showing notification
    setTimeout(() => {
      navigate("/");   // ⬅ Sends user back to Role Selection page
    }, 2000); // Show notification for 2 seconds before redirect
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

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
