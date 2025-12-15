// SignupPage.jsx - UPDATED WITH CONSISTENT DESIGN
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import API_BASE_URL from "../config";
import emailjs from '@emailjs/browser';

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

  // Step 1: Send OTP via EmailJS
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    if (!email) {
      alert("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Call backend to generate and store OTP
      const generateRes = await fetch(`${API_BASE_URL}/api/auth/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const generateData = await generateRes.json();
      
      if (!generateRes.ok) {
        throw new Error(generateData.message || "Failed to generate OTP");
      }

      // 2. Send email via EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: email,
          to_name: email.split('@')[0],
          otp_code: generateData.otp,
          expiration_time: "10 minutes",
          app_name: "Digital Guidance",
          current_year: new Date().getFullYear()
        }
      );
      
      // Move to verification step
      setStep(2);
      setTimer(600); // 10 minutes
      setResendDisabled(true);
      setTimeout(() => setResendDisabled(false), 60000);
      
      alert("✅ Verification code has been sent to your email!");
      
    } catch (err) {
      console.error("OTP sending error:", err);
      if (err.message.includes("Failed to generate OTP")) {
        alert("❌ " + err.message);
      } else if (err.text?.includes("emailjs")) {
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
    setIsLoading(true);

    try {
      const generateRes = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const generateData = await generateRes.json();
      
      if (!generateRes.ok) {
        throw new Error(generateData.message || "Failed to generate new OTP");
      }

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: email,
          to_name: email.split('@')[0],
          otp_code: generateData.otp,
          expiration_time: "10 minutes",
          app_name: "Digital Guidance",
          current_year: new Date().getFullYear()
        }
      );
      
      alert("✅ New verification code sent to your email!");
      setTimer(600);
      setAttemptsLeft(3);
      
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("❌ " + (err.message || "Failed to resend verification code"));
    } finally {
      setIsLoading(false);
      setTimeout(() => setResendDisabled(false), 60000);
    }
  };

  return (
    <div className="auth-wrapper-split">
      {/* Left Side - Image/Decoration */}
      <div className="auth-left-side">
        <div className="auth-image-placeholder">
          <div className="auth-image-content">
            <h2>Join Digital Guidance</h2>
            <p>Create your account and start your digital journey</p>
            <div className="auth-image-decoration">
              <div className="auth-decoration-circle"></div>
              <div className="auth-decoration-square"></div>
              <div className="auth-decoration-triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="auth-right-side">
        <div className="auth-container">
          <div className="auth-content">
            {/* Back Button */}
            <div className="back-button-container">
              <button 
                className="back-button"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                ← Back to Login
              </button>
            </div>

            <div className="auth-header">
              <h1>Create Account</h1>
              <p className="auth-welcome-text">Sign Up to Digital Guidance</p>
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOTP} className="auth-form">
                <div className="auth-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="auth-input"
                  />
                  <p className="auth-hint">
                    We'll send a verification code to this email.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="auth-form-group">
                  <p className="auth-info">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                  
                  <label htmlFor="otp">Verification Code</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) setOtp(value);
                    }}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="auth-input auth-otp-input"
                  />
                  
                  <div className="auth-timer-info">
                    {timer > 0 ? (
                      <p className="auth-timer">
                        Code expires in: {formatTime(timer)}
                      </p>
                    ) : (
                      <p className="auth-timer-expired">Code expired</p>
                    )}
                    <p>Attempts left: {attemptsLeft}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendDisabled || isLoading}
                    className="auth-button-secondary"
                  >
                    {resendDisabled ? "Resend in 60s" : "Resend Code"}
                  </button>
                </div>

                <div className="auth-button-group">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(""); }}
                    disabled={isLoading}
                    className="auth-button-outline"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="auth-button"
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSignup} className="auth-form">
                <div className="auth-form-group">
                  <p className="auth-info">
                    Email verified: <strong>{email}</strong>
                  </p>

                  <label htmlFor="password">Password</label>
                  <div className="auth-password-container">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {password.length > 0 && password.length < 8 && (
                    <p className="auth-error">
                      Password must be at least 8 characters long.
                    </p>
                  )}

                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="auth-password-container">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      disabled={isLoading}
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <p className="auth-error">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <div className="auth-button-group">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="auth-button-outline"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="auth-button"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="auth-link auth-link-bold"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
