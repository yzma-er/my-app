// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css"; // reuse styling
import API_BASE_URL from "../config";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 👁️ visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully!");
        navigate("/login");
      } else {
        alert(data.message || "❌ Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("An error occurred. Try again later.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        <div className="login-form">
          <h1>Create Account</h1>
          <h3>Sign Up to Digital Guidance</h3>

          <form onSubmit={handleSignup}>
            
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD FIELD */}
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } toggle-icon`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div className="password-container">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <i
                className={`fa-solid ${
                  showConfirm ? "fa-eye-slash" : "fa-eye"
                } toggle-icon`}
                onClick={() => setShowConfirm(!showConfirm)}
              ></i>
            </div>

            <button type="submit">Sign Up</button>
          </form>

          <p className="signup-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default SignupPage;
