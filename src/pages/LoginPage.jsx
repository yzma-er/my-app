import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 FIX: Correct backend URL
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // Detect role (user or admin)
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
          alert(`⚠️ This account is not authorized for ${role} login!`);
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        
        if (decoded.role === "user") {
          localStorage.setItem("justLoggedIn", "true");
        }
        
        // Show success message
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

  // ADMIN LOGIN WITH SPLIT LAYOUT AND IMAGE
  if (role === "admin") {
    return (
      <div className="auth-wrapper-split">
        {/* Left Side - NVSVU Image */}
        <div className="auth-left-side admin-left-side">
          <div className="admin-image-container">
            
            
           
            <img 
              src="adminBuilding.jpg" 
              alt="Nueva Vizcaya State University Campus" 
              className="admin-campus-image"
            />
             <div className="admin-image-overlay">
               {/* Add your logo here */}
              <div className="admin-logo-container">
                <img 
                  src="nvsu-logo.gif" 
                  alt="Nueva Vizcaya State University Logo"
                  className="admin-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              
              <p className="admin-portal-text">
                Administrative Portal
              </p>
              
            </div>
          </div>
        </div>

        {/* Right Side - Admin Login Form */}
        <div className="auth-right-side admin-right-side">
          <div className="auth-container">
            <div className="auth-content">
              {/* Header with Back Button */}
              <div className="auth-header">
                <button 
                  className="back-button"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  ← Back to Home
                </button>
                <h1 className="admin-login-title">Admin Login</h1>
                <p className="auth-welcome-text">
                  Access administrative functions and system management
                </p>
              </div>

              {/* Admin Login Form */}
              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-form-group">
                  <label htmlFor="admin-email" className="admin-label">
                    Admin Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@nvsu.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="auth-input admin-input"
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="admin-password" className="admin-label">
                    Password
                  </label>
                  <div className="auth-password-container">
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="auth-input admin-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle admin-password-toggle"
                      onClick={() => !loading && setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <p className="auth-hint admin-hint">
                    Use your administrator credentials provided by NVSU
                  </p>
                </div>

                <div className="auth-options admin-options">
                  <label className="auth-remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="auth-button admin-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="auth-loader"></div>
                      AUTHENTICATING...
                    </>
                  ) : (
                    "SIGN IN"
                  )}
                </button>
              </form>

            
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER LOGIN UI (unchanged)
  return (
    <div className="auth-wrapper-split">
      {/* Left Side - Image/Decoration */}
      <div className="auth-left-side">
        <div className="auth-image-placeholder">
          <div className="auth-image-content">
            <div className="role-badge">
              👤 User Access
            </div>
            <h2>Digital Guidance</h2>
            <p>
              Auxiliary Services
            </p>
            <div className="auth-image-decoration">
              <div className="auth-decoration-circle"></div>
              <div className="auth-decoration-square"></div>
              <div className="auth-decoration-triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-right-side">
        <div className="auth-container">
          <div className="auth-content">
            {/* Header with Role Indicator and Back Button INLINE */}
            <div className="auth-header">
              <div className="role-indicator-inline">
                <span className="role-tag user-tag">
                  User Login
                </span>
                <button 
                  className="back-button-inline"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  ← Back to Home
                </button>
              </div>
              <h1>Login</h1>
              <p className="auth-welcome-text">
                Welcome back! Please login to your account.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="auth-input"
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="password">Password</label>
                <div className="auth-password-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="***********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => !loading && setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="auth-remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember Me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="auth-link"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="auth-loader"></div>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Signup link for user login */}
            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="auth-link auth-link-bold"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
