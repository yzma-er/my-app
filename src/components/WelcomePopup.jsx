// src/components/WelcomePopups.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./WelcomePopup.css";

function WelcomePopup({ userEmail, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // ✅ Define handleClose with useCallback
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for slide-out animation
  }, [onClose]);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // Auto-close after 10 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [handleClose]); // handleClose is stable due to useCallback

  // Extract name from email (before @)
  const getUserName = (email) => {
    if (!email) return "User";
    const namePart = email.split('@')[0];
    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  return (
    <div className={`welcome-popup-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`welcome-popup ${isVisible ? 'slide-in' : 'slide-out'}`}>
        <div className="welcome-header">
          <div className="welcome-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1C7C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="#1C7C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="#1C7C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <button 
            className="welcome-close-btn"
            onClick={handleClose}
            aria-label="Close welcome message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="welcome-content">
          <h3>Welcome, {getUserName(userEmail)}! 👋</h3>
          <p>You're successfully logged in as:</p>
          <div className="user-email-display">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#1C7C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="#1C7C0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{userEmail}</span>
          </div>
          <p className="welcome-message">Start exploring our services or continue where you left off.</p>
        </div>
        
        <div className="welcome-actions">
          <button className="welcome-primary-btn" onClick={handleClose}>
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePopup;
