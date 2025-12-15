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

  // 🔥 FIX: Correct backend URL (local = localhost, deployed = render)
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
          alert("⚠️ Invalid role for this account!");
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("token", data.token);
        
        // ✅ ADD THIS: Store email for welcome popup
        localStorage.setItem("userEmail", email);
        
        // ✅ ADD THIS: Set flag for welcome popup (only for users, not admins)
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
    <div className="login-wrapper-split">
      {/* Left Side - Image/Decoration */}
      <div className="login-left-side">
        <div className="login-image-placeholder">
          <div className="image-content">
            <h2>Digital Guidance</h2>
            <p>Your journey to digital excellence starts here</p>
            <div className="image-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-square"></div>
              <div className="decoration-triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right-side">
        <div className="login-container-split">
          <div className="login-content-split">
            <div className="login-header-split">
              <h1>Login</h1>
              <p className="welcome-text-split">Welcome back! Please login to your account.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="form-group-split">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="andgmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="email-input-split"
                />
              </div>

              <div className="form-group-split">
                <label htmlFor="password">Password</label>
                <div className="password-container-split">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="***********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-split"
                    onClick={() => !loading && setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-options-split">
                <label className="remember-me-split">
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
                  className="forgot-password-link-split"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-btn-split"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loader-split"></div>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="signup-link-container-split">
              <p>
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="signup-link-new-split"
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
