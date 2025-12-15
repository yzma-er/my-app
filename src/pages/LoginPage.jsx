import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 FIX: Correct backend URL (local = localhost, deployed = render)
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // Detect role (user or admin)
  const role = new URLSearchParams(location.search).get("role") || "user";

  // Create floating particles
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
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
          setShake(true);
          setTimeout(() => setShake(false), 500);
          alert("⚠️ Invalid role for this account!");
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("token", data.token);
        
        // Store email for welcome popup
        localStorage.setItem("userEmail", email);
        
        // Set flag for welcome popup (only for users, not admins)
        if (decoded.role === "user") {
          localStorage.setItem("justLoggedIn", "true");
        }
        
        // Success animation before redirect
        setTimeout(() => {
          if (decoded.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/services");
          }
          setLoading(false);
        }, 1500);
        
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        alert(data.message || "❌ Login failed.");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      alert("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Floating particles background */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated gradient background */}
      <div className="gradient-background">
        <div className="gradient-1"></div>
        <div className="gradient-2"></div>
        <div className="gradient-3"></div>
      </div>

      <div className={`login-container ${shake ? 'shake' : ''}`}>
        {/* Decorative elements */}
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        
        {/* Login Card with glassmorphism effect */}
        <div className="login-card">
          {/* Card Header */}
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2 className="logo-text">DigitalGuidance</h2>
            </div>
            <div className={`role-badge ${role}`}>
              {role === "admin" ? "🔐 Admin Access" : "👤 User Portal"}
            </div>
          </div>

          {/* Welcome Section */}
          <div className="welcome-section">
            <h1>
              {role === "admin" 
                ? "Welcome Back, Administrator" 
                : "Welcome to Digital Guidance"}
            </h1>
            <p className="welcome-subtitle">
              {role === "admin" 
                ? "Manage your system with precision and insight"
                : "Access personalized services and resources"}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form-enhanced">
            {/* Email Input with icon */}
            <div className="input-group">
              <div className="input-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="input-field"
              />
              <div className="input-underline"></div>
            </div>

            {/* Password Input with icon and toggle */}
            <div className="input-group">
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="input-field"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => !loading && setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              <div className="input-underline"></div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className={`login-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="button-loader"></span>
                  <span className="button-text">Authenticating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Social Login Divider */}
            <div className="social-divider">
              <span>Or continue with</span>
            </div>

            {/* Social Login Buttons */}
            <div className="social-login">
              <button type="button" className="social-button google">
                <i className="fab fa-google"></i>
                Google
              </button>
              <button type="button" className="social-button microsoft">
                <i className="fab fa-microsoft"></i>
                Microsoft
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="login-footer">
            {role === "user" && (
              <p className="signup-prompt">
                New to Digital Guidance?{" "}
                <Link to="/signup" className="signup-link">
                  Create an account
                </Link>
              </p>
            )}
            
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link to="/terms">Terms of Service</Link>
              <span className="separator">•</span>
              <Link to="/support">Help Center</Link>
            </div>
            
            <p className="copyright">
              © 2024 Digital Guidance System. All rights reserved.
            </p>
          </div>
        </div>

        {/* Side Illustration/Info Panel */}
        <div className="info-panel">
          <div className="info-content">
            <div className="info-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h3>Secure & Reliable</h3>
            <p>
              Enterprise-grade security with end-to-end encryption and 
              multi-factor authentication.
            </p>
            
            <div className="features-list">
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Real-time Activity Monitoring</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>GDPR Compliant</span>
              </div>
            </div>
            
            <div className="stats">
              <div className="stat">
                <strong>99.9%</strong>
                <span>Uptime</span>
              </div>
              <div className="stat">
                <strong>10K+</strong>
                <span>Users</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast for errors/success */}
      <div className="notification-toast">
        <div className="toast-content">
          <i className="fas fa-info-circle"></i>
          <span>Enter your credentials to access the system</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
