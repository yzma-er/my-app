// ForgotPasswordPage.jsx - Request password reset
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
            purpose: 'password_reset'
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
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-form">
          <h1>Forgot Password</h1>
          <h3>Reset your Digital Guidance password</h3>

          {step === 1 && (
            <form onSubmit={handleRequestReset}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
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
                {isLoading ? "Sending Code..." : "Send Reset Code"}
              </button>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Link to="/login" style={{ color: "#2563eb" }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyResetOTP}>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "15px" }}>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
                
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Reset Code
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
                  onClick={handleResendResetOTP}
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
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "15px" }}>
                  Set new password for <strong>{email}</strong>
                </p>

                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  New Password
                </label>
                <div className="password-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"} toggle-icon`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  ></i>
                </div>

                {newPassword.length > 0 && newPassword.length < 8 && (
                  <p style={{ color: "red", fontSize: "13px", marginBottom: "6px" }}>
                    Password must be at least 8 characters long.
                  </p>
                )}

                <label style={{ display: "block", marginBottom: "8px", marginTop: "15px", fontWeight: "500" }}>
                  Confirm New Password
                </label>
                <div className="password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} toggle-icon`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></i>
                </div>

                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
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
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
