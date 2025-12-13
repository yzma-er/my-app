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
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-form">
          <h1>{role === "admin" ? "Admin Login" : "User Login"}</h1>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-icon ${loading ? 'disabled-icon' : ''}`}
                onClick={() => !loading && setShowPassword(!showPassword)}
              ></i>
            </div>

            <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
              {loading ? (
                <>
                  <div className="loader"></div>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link to="/forgot-password" style={{ color: "#2563eb", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          {role === "user" && (
            <p className="signup-link">
              New user? <Link to="/signup">Sign Up</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
