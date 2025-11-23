import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          return;
        }

        localStorage.setItem("token", data.token);
        alert("✅ Login successful!");

        if (decoded.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/services");
        }
      } else {
        alert(data.message || "❌ Login failed.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("Connection error. Please try again.");
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
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-icon`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <button type="submit">Log In</button>
          </form>

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
