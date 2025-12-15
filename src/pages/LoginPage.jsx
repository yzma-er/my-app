import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverField, setHoverField] = useState(null);
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
        
        // Success animation
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
      {/* Floating Leaves Animation */}
      <div className="leaves-container">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="leaf"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
              fontSize: `${Math.random() * 20 + 10}px`,
              color: `rgba(34, 197, 94, ${Math.random() * 0.3 + 0.1})`
            }}
          >
            <i className="fas fa-leaf"></i>
          </div>
        ))}
      </div>

      {/* Green Gradient Background */}
      <div className="green-gradient">
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
        <div className="gradient-circle circle-3"></div>
      </div>

      {/* Main Login Container */}
      <div className="login-container-aesthetic">
        {/* Left Side - Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="nature-icon">
              <i className="fas fa-seedling"></i>
            </div>
            <h2 className="visual-title">
              {role === "admin" ? "Digital Garden" : "Welcome Back"}
            </h2>
            <p className="visual-text">
              {role === "admin" 
                ? "Nurture your digital ecosystem"
                : "Grow with us in your digital journey"}
            </p>
            <div className="plant-progress">
              <div className="plant">
                <i className="fas fa-spa"></i>
                <div className="growth">
                  <div className="growth-bar" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="plant">
                <i className="fas fa-tree"></i>
                <div className="growth">
                  <div className="growth-bar" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="plant">
                <i className="fas fa-leaf"></i>
                <div className="growth">
                  <div className="growth-bar" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-aesthetic">
          <div className="form-header">
            <div className="form-logo">
              <i className="fas fa-leaf"></i>
              <span>DigitalGuidance</span>
            </div>
            <div className="role-tag">
              {role === "admin" ? "🌿 Admin" : "🌱 User"}
            </div>
          </div>

          <div className="welcome-message">
            <h1>
              {role === "admin" 
                ? "Tend to Your Garden"
                : "Continue Growing"}
            </h1>
            <p>Enter your credentials to blossom</p>
          </div>

          <form onSubmit={handleLogin} className="login-form-content">
            {/* Email Field */}
            <div 
              className={`form-field ${hoverField === 'email' ? 'field-hover' : ''}`}
              onMouseEnter={() => setHoverField('email')}
              onMouseLeave={() => setHoverField(null)}
            >
              <div className="field-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="field-input"
              />
              <div className="field-decoration">
                <div className="field-dot"></div>
                <div className="field-dot"></div>
                <div className="field-dot"></div>
              </div>
            </div>

            {/* Password Field */}
            <div 
              className={`form-field ${hoverField === 'password' ? 'field-hover' : ''}`}
              onMouseEnter={() => setHoverField('password')}
              onMouseLeave={() => setHoverField(null)}
            >
              <div className="field-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="field-input"
              />
              <button
                type="button"
                className="password-toggle-aesthetic"
                onClick={() => !loading && setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              <div className="field-decoration">
                <div className="field-dot"></div>
                <div className="field-dot"></div>
                <div className="field-dot"></div>
              </div>
            </div>

            {/* Options */}
            <div className="form-options-aesthetic">
              <label className="remember-check">
                <input type="checkbox" />
                <span className="check-box">
                  <i className="fas fa-check"></i>
                </span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className={`login-btn-aesthetic ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? (
                <>
                  <div className="btn-loader">
                    <i className="fas fa-spinner"></i>
                  </div>
                  <span>Growing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Let's Grow</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider-aesthetic">
              <div className="divider-line"></div>
              <span>or continue with</span>
              <div className="divider-line"></div>
            </div>

            {/* Alternative Login */}
            <div className="alt-login">
              <button type="button" className="alt-btn">
                <i className="fab fa-google"></i>
              </button>
              <button type="button" className="alt-btn">
                <i className="fab fa-github"></i>
              </button>
              <button type="button" className="alt-btn">
                <i className="fab fa-apple"></i>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="form-footer">
            {role === "user" && (
              <p className="signup-text">
                New here? <Link to="/signup" className="signup-link-aesthetic">Plant your seed</Link>
              </p>
            )}
            <div className="footer-links-aesthetic">
              <a href="#privacy">Privacy</a>
              <span>•</span>
              <a href="#terms">Terms</a>
              <span>•</span>
              <a href="#help">Help</a>
            </div>
            <p className="copyright-aesthetic">
              © 2024 Digital Garden • Nurturing growth
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Birds */}
      <div className="birds">
        <div className="bird bird-1">
          <i className="fas fa-dove"></i>
        </div>
        <div className="bird bird-2">
          <i className="fas fa-dove"></i>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
