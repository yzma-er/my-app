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

  return (
    <div className="auth-wrapper-split">
      {/* Left Side - Image/Decoration */}
      <div className="auth-left-side">
        <div className="auth-image-placeholder">
          <div className="auth-image-content">
            <div className="role-badge">
              {role === "admin" ? "🔐 Admin Access" : "👤 User Access"}
            </div>
            <h2>{role === "admin" ? "Admin Portal" : "Digital Guidance"}</h2>
            <p>
              {role === "admin" 
                ? "Access the administrative dashboard" 
                : "Your journey to digital excellence starts here"}
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
    <span className={`role-tag ${role}-tag`}>
      {role === "admin" ? "Administrator" : "User"} Login
    </span>
    <button 
      className="back-button-inline"
      onClick={() => navigate("/")}
      disabled={loading}
    >
      ← Back to Home
    </button>
  </div>
  <h1>{role === "admin" ? "Admin Login" : "Login"}</h1>
  <p className="auth-welcome-text">
    {role === "admin" 
      ? "Access administrative functions and system management" 
      : "Welcome back! Please login to your account."}
  </p>
</div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="email">
                  {role === "admin" ? "Admin Email" : "Email"}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={role === "admin" ? "admin@digitalguidance.com" : "andgmail.com"}
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
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {role === "admin" && (
                  <p className="auth-hint">
                    Use your administrator credentials
                  </p>
                )}
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
                {role === "user" && (
                  <Link 
                    to="/forgot-password" 
                    className="auth-link"
                    onClick={(e) => loading && e.preventDefault()}
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>

              <button 
                type="submit" 
                className={`auth-button ${role === "admin" ? "admin-button" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="auth-loader"></div>
                    {role === "admin" ? "Authenticating..." : "Logging in..."}
                  </>
                ) : (
                  role === "admin" ? "Access Dashboard" : "Login"
                )}
              </button>
            </form>

            {/* Only show signup link for user login */}
            {role === "user" && (
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
            )}

            {/* Admin login shows different message */}
            {role === "admin" && (
              <div className="auth-footer">
                <p className="admin-note">
                  🔒 Restricted access. Contact system administrator for credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
