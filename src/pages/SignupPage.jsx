// SignupPage.jsx - EMAILJS ONLY (No OTP logging)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import API_BASE_URL from "../config";
import emailjs from '@emailjs/browser';

// Your EmailJS credentials
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_kku64qi',
  TEMPLATE_ID: 'template_4sgjelo',
  PUBLIC_KEY: 'wyYCTD154FjbgcZZg'
};

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const navigate = useNavigate();

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // Timer for OTP expiration
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Step 1: Send OTP via EmailJS ONLY
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    if (!email) {
      alert("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Generate OTP locally
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

      // 1. Store OTP in backend first
      const storeRes = await fetch(`${API_BASE_URL}/api/auth/store-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: generatedOTP })
      });

      const storeData = await storeRes.json();
      
      if (!storeRes.ok) {
        throw new Error(storeData.message || "Failed to process OTP request");
      }

      // 2. Send email via EmailJS
      const emailResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: email,
          to_name: email.split('@')[0],
          otp_code: generatedOTP,
          expiration_time: "10 minutes",
          app_name: "Digital Guidance",
          current_year: new Date().getFullYear()
        }
      );

      console.log("✅ Email sent successfully:", emailResult);
      
      // Move to verification step
      setStep(2);
      setTimer(600); // 10 minutes
      setResendDisabled(true);
      setTimeout(() => setResendDisabled(false), 60000);
      
      alert("✅ Verification code has been sent to your email!");
      
    } catch (err) {
      console.error("OTP sending error:", err);
      
      // If EmailJS fails, show error (NO OTP DISPLAY)
      if (err.text?.includes("emailjs")) {
        alert("❌ Failed to send verification email. Please check your email address and try again.");
      } else {
        alert("❌ " + (err.message || "Failed to send verification code. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Email verified successfully!");
        setStep(3);
      } else {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
          if (data.attemptsLeft <= 0) {
            alert("❌ Too many failed attempts. Please request a new OTP.");
            setStep(1);
            setOtp("");
          }
        }
        alert(data.message || "❌ Invalid verification code.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("❌ An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      alert("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully!");
        navigate("/login");
      } else {
        alert(data.message || "❌ Signup failed.");
        if (data.message?.includes("not verified")) {
          setStep(1);
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    await handleSendOTP();
    setTimeout(() => setResendDisabled(false), 60000);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-form">
          <h1>Create Account</h1>
          <h3>Sign Up to Digital Guidance</h3>

          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
                <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
                  We'll send a verification code to this email.
                </p>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "15px" }}>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
                
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) setOtp(value);
                  }}
                  maxLength={6}
                  required
                  style={{ 
                    width: "100%",
                    fontSize: "20px",
                    letterSpacing: "10px",
                    textAlign: "center"
                  }}
                />
                
                <div style={{ marginTop: "10px", fontSize: "14px" }}>
                  {timer > 0 ? (
                    <p style={{ color: "#dc2626" }}>
                      Code expires in: {formatTime(timer)}
                    </p>
                  ) : (
                    <p style={{ color: "#dc2626" }}>Code expired</p>
                  )}
                  <p>Attempts left: {attemptsLeft}</p>
                </div>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || isLoading}
                  style={{
                    marginTop: "10px",
                    background: "transparent",
                    color: "#2563eb",
                    border: "1px solid #2563eb",
                    width: "100%"
                  }}
                >
                  {resendDisabled ? "Resend in 60s" : "Resend Code"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(""); }}
                  style={{ flex: 1, background: "#6b7280" }}
                >
                  Back
                </button>
                <button type="submit" disabled={isLoading} style={{ flex: 2 }}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "15px" }}>
                  Email verified: <strong>{email}</strong>
                </p>

                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Password
                </label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-icon`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>

                {password.length > 0 && password.length < 8 && (
                  <p style={{ color: "red", fontSize: "13px", marginBottom: "6px" }}>
                    Password must be at least 8 characters long.
                  </p>
                )}

                <label style={{ display: "block", marginBottom: "8px", marginTop: "15px", fontWeight: "500" }}>
                  Confirm Password
                </label>
                <div className="password-container">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"} toggle-icon`}
                    onClick={() => setShowConfirm(!showConfirm)}
                  ></i>
                </div>

                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p style={{ color: "red", fontSize: "13px", marginBottom: "6px" }}>
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, background: "#6b7280" }}
                >
                  Back
                </button>
                <button type="submit" disabled={isLoading} style={{ flex: 2 }}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p className="signup-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
