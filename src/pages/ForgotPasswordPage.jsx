// ForgotPasswordPage.jsx - UPDATED WITH CONSISTENT DESIGN
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import API_BASE_URL from "../config";
import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_kku64qi',
  TEMPLATE_ID: 'template_ajktzw8',
  PUBLIC_KEY: 'wyYCTD154FjbgcZZg'
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
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
      // Request reset OTP from backend
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // Send email via EmailJS
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          {
            to_email: email,
            to_name: email.split('@')[0],
            otp_code: data.otp,
            expiration_time: "15 minutes",
            app_name: "Digital Guidance",
            current_year: new Date().getFullYear(),
          }
        );

        alert("✅ Password reset code sent to your email!");
        setStep(2);
        setTimer(900); // 15 minutes
        setResendDisabled(true);
        setTimeout(() => setResendDisabled(false), 60000);
      } else {
        alert(data.message || "Failed to send reset code.");
      }
    } catch (err) {
      console.error("Request reset error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset OTP
  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        setResetToken(data.resetToken);
        alert("✅ Code verified! Now set your new password.");
        setStep(3);
      } else {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
          if (data.attemptsLeft <= 0) {
            alert("Too many failed attempts. Please request a new code.");
            setStep(1);
            setOtp("");
          }
        }
        alert(data.message || "Invalid code.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Password reset successfully! You can now login with your new password.");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset OTP
  const handleResendResetOTP = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // Send email via EmailJS
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          {
            to_email: email,
            to_name: email.split('@')[0],
            otp_code: data.otp,
            expiration_time: "15 minutes",
            app_name: "Digital Guidance",
            current_year: new Date().getFullYear(),
            purpose: 'password_reset'
          }
        );

        alert("✅ New reset code sent to your email!");
        setTimer(900); // Reset to 15 minutes
      } else {
        alert(data.message || "Failed to resend code.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      alert("Failed to resend code.");
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
            <h2>Reset Password</h2>
            <p>Secure your account with a new password</p>
            <div className="auth-image-decoration">
              <div className="auth-decoration-circle"></div>
              <div className="auth-decoration-square"></div>
              <div className="auth-decoration-triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
              <h1>Forgot Password</h1>
              <p className="auth-welcome-text">Reset your Digital Guidance password</p>
            </div>

            {step === 1 && (
              <form onSubmit={handleRequestReset} className="auth-form">
                <div className="auth-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
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
                  {isLoading ? "Sending Code..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyResetOTP} className="auth-form">
                <div className="auth-form-group">
                  <p className="auth-info">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                  
                  <label htmlFor="otp">Reset Code</label>
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
                    onClick={handleResendResetOTP}
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
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="auth-form-group">
                  <p className="auth-info">
                    Set new password for <strong>{email}</strong>
                  </p>

                  <label htmlFor="newPassword">New Password</label>
                  <div className="auth-password-container">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="auth-error">
                      Password must be at least 8 characters long.
                    </p>
                  )}

                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="auth-password-container">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && confirmPassword !== newPassword && (
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
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}

            <div className="auth-footer">
              <p>
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="auth-link auth-link-bold"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
