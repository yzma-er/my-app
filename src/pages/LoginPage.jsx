import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  const role = new URLSearchParams(location.search).get("role") || "user";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const [, payload] = data.token.split(".");
        const decoded = JSON.parse(atob(payload));

        if (decoded.role !== role) {
          alert("⚠️ Invalid role for this account!");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        
        if (decoded.role === "user") {
          localStorage.setItem("justLoggedIn", "true");
        }
        
        setTimeout(() => {
          if (decoded.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/services");
          }
          setLoading(false);
        }, 1000);
        
      } else {
        alert(data.message || "❌ Login failed.");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* University-style background */}
      <div className="university-background">
        <div className="accent-bar"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Main container */}
      <div className="login-container-semi">
        {/* Left side - University Info */}
        <div className="university-side">
          <div className="university-header">
            <div className="university-logo">
              <div className="logo-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="logo-text">
                <h3>Nueva Vizcaya State University</h3>
                <p>Digital Guidance System</p>
              </div>
            </div>
          </div>

          <div className="university-info">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-university"></i>
              </div>
              <h4>University Portal</h4>
              <p>Secure access to NVSU's digital services and resources</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Secure Authentication</h4>
              <p>Protected by enterprise-grade security protocols</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>{role === "admin" ? "Administrative Access" : "Student/Faculty Access"}</h4>
              <p>Role-based access to appropriate services</p>
            </div>
          </div>

          <div className="university-footer">
            <div className="contact-info">
              <p><i className="fas fa-phone"></i> IT Help Desk: (078) 123-4567</p>
              <p><i className="fas fa-envelope"></i> support@nvsu.edu.ph</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-side">
          <div className="login-header">
            <h2>Welcome to NVSU Portal</h2>
            <div className="role-indicator">
              <span className="role-badge">
                {role === "admin" ? "Administrator Login" : "Student/Faculty Login"}
              </span>
              <div className="secure-indicator">
                <i className="fas fa-lock"></i>
                <span>Secure Connection</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form-semi">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-user-circle"></i>
                University Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@student.nvsu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-key"></i>
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => !loading && setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="remember"
                  disabled={loading}
                />
                <label htmlFor="remember">Keep me signed in</label>
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`login-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>

            <div className="divider">
              <span>New to NVSU Portal?</span>
            </div>

            {role === "user" && (
              <div className="signup-section">
                <p>Don't have an account yet?</p>
                <Link to="/signup" className="signup-btn">
                  <i className="fas fa-user-plus"></i>
                  Create Student Account
                </Link>
              </div>
            )}

            <div className="quick-links">
              <h4>Quick Access:</h4>
              <div className="links-grid">
                <a href="#" className="quick-link">
                  <i className="fas fa-book"></i>
                  Student Handbook
                </a>
                <a href="#" className="quick-link">
                  <i className="fas fa-calendar-alt"></i>
                  Academic Calendar
                </a>
                <a href="#" className="quick-link">
                  <i className="fas fa-question-circle"></i>
                  Help & Support
                </a>
                <a href="#" className="quick-link">
                  <i className="fas fa-download"></i>
                  Download Forms
                </a>
              </div>
            </div>
          </form>

          <div className="login-footer">
            <p className="disclaimer">
              <i className="fas fa-info-circle"></i>
              By signing in, you agree to comply with NVSU's Acceptable Use Policy.
            </p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <span className="separator">|</span>
              <a href="#">Terms of Service</a>
              <span className="separator">|</span>
              <a href="#">Accessibility</a>
              <span className="separator">|</span>
              <a href="#">Contact IT</a>
            </div>
            <p className="copyright">
              © {new Date().getFullYear()} Nueva Vizcaya State University. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <div className="status-indicator">
          <div className="status-dot active"></div>
          <span>System Status: Operational</span>
        </div>
        <div className="last-updated">
          <i className="fas fa-sync-alt"></i>
          Last updated: Just now
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
