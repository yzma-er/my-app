// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom"; // ✅ import Link
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 🏛 Left Section */}
        <div className="footer-left">
          <h3>ASP Digital Guidance</h3>
          <p>
            A centralized digital guide for accessing university services with
            ease and transparency.
          </p>
        </div>

        {/* 🔗 Middle Section */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/about">About</Link> 
            </li>
          </ul>
        </div>

        {/* 📞 Right Section */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>📍 Nueva Vizcaya State University</p>
          <p>✉️ support@nvsu.edu.ph</p>
          <p>📞 (078) 321-1234</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ASP Digital Guidance | Developed by
          Team <strong>AXYLE</strong>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
