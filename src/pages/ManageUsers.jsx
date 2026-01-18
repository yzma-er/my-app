// src/pages/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";
import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_kku64qi',
  TEMPLATE_ID: 'template_4sgjelo',
  PUBLIC_KEY: 'wyYCTD154FjbgcZZg'
};

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // OTP states
  const [otpStep, setOtpStep] = useState(1); // 1: enter email, 2: verify OTP, 3: enter password
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const navigate = useNavigate();

  // ✅ Auto-detect backend (Laptop vs. Phone)
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ✅ Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // ✅ Timer for OTP expiration
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // ✅ Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      
      // Better token validation
      if (!token) {
        alert("❌ No token found. Please log in again.");
        navigate("/login");
        return;
      }

      // Check if token is expired or invalid
      try {
        // Decode token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          alert("❌ Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Invalid token:", error);
        alert("❌ Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          // Unauthorized - token is invalid or user is not admin
          alert("❌ Access denied. Please ensure you are logged in as admin.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        if (err.message.includes("401")) {
          alert("Access denied. Please ensure you are logged in as admin.");
        } else {
          alert("Failed to load users. Please check your connection and try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backendURL, navigate]);

  // ✅ Filtered users based on search
  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Format OTP timer
  const formatOtpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ✅ Send OTP via EmailJS
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    
    if (!newAdminData.email) {
      alert("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // Generate OTP (6-digit)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(generatedOtp);
      
      // Send email via EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: newAdminData.email,
          to_name: newAdminData.email.split('@')[0],
          otp_code: generatedOtp,
          expiration_time: "10 minutes",
          app_name: "Digital Guidance",
          current_year: new Date().getFullYear()
        }
      );
      
      // Move to verification step
      setOtpStep(2);
      setOtpTimer(600); // 10 minutes
      setIsResendDisabled(true);
      setTimeout(() => setIsResendDisabled(false), 60000);
      
      alert("✅ Verification code has been sent to the email!");
      
    } catch (err) {
      console.error("OTP sending error:", err);
      alert("❌ Failed to send verification email. Please try again.");
    }
  };

  // ✅ Verify OTP
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    // Verify OTP
    if (otp !== generatedOtp) {
      const newAttempts = otpAttemptsLeft - 1;
      setOtpAttemptsLeft(newAttempts);
      
      if (newAttempts <= 0) {
        alert("❌ Too many failed attempts. Please request a new OTP.");
        setOtpStep(1);
        setOtp("");
        setOtpAttemptsLeft(3);
      } else {
        alert(`❌ Invalid verification code. ${newAttempts} attempts left.`);
      }
      return;
    }

    // OTP verified successfully
    alert("✅ Email verified successfully!");
    setOtpStep(3);
  };

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    if (isResendDisabled) return;
    setIsResendDisabled(true);

    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      
      // Send email via EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: newAdminData.email,
          to_name: newAdminData.email.split('@')[0],
          otp_code: newOtp,
          expiration_time: "10 minutes",
          app_name: "Digital Guidance",
          current_year: new Date().getFullYear()
        }
      );
      
      alert("✅ New verification code sent!");
      setOtpTimer(600);
      setOtpAttemptsLeft(3);
      setOtp("");
      
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("❌ Failed to resend verification code");
    } finally {
      setTimeout(() => setIsResendDisabled(false), 60000);
    }
  };

  // ✅ Create Admin Account (final step after OTP verification)
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!newAdminData.email || !newAdminData.password || !newAdminData.confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    // 🔐 Minimum 8 characters (matching SignupPage)
    if (newAdminData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (newAdminData.password !== newAdminData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newAdminData.email,
          password: newAdminData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Admin account created successfully!");
        
        // Reset everything
        setNewAdminData({ email: "", password: "", confirmPassword: "" });
        setShowCreateAdmin(false);
        setOtpStep(1);
        setOtp("");
        setShowPassword(false);
        setShowConfirm(false);
        setOtpTimer(0);
        
        // Refresh users list
        const usersRes = await fetch(`${backendURL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        }
      } else {
        alert(`❌ ${data.message || "Failed to create admin account"}`);
      }
    } catch (err) {
      console.error("❌ Error creating admin:", err);
      alert("Failed to create admin account.");
    }
  };

  // ✅ Change password
  const handlePasswordChange = async (id) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/users/${id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        alert("✅ Password updated successfully!");
      } else {
        alert("❌ Failed to update password");
      }
    } catch (err) {
      console.error("❌ Error updating password:", err);
    }
  };

  // ✅ Delete user
  //const handleDelete = async (id) => {
    //if (!window.confirm("Are you sure you want to delete this user?")) return;

    //try {
      //const token = localStorage.getItem("token");
      //const res = await fetch(`${backendURL}/api/admin/users/${id}`, {
        //method: "DELETE",
        //headers: { Authorization: `Bearer ${token}` },
      //});

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        alert("🗑️ User deleted successfully!");
      } else {
        alert("❌ Failed to delete user");
      }
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  // ✅ Loading state
  if (loading) return <p>Loading users...</p>;

  return (
    <div className="manage-users">
      
      {/* Back button */}
      <div style={{ position: "relative", marginBottom: "20px", height: "40px" }}>
        <button
          className="back-admin-btn"
          onClick={() => navigate("/admin")}
          style={{
            padding: "6px 12px",
            borderRadius: "30px",
            backgroundColor: "#1c7c0f",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            position: "absolute",
            left: 0,
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>←</span>
        </button>
      </div>

      <h1>👥 Manage Users</h1>
      
      {/* User Statistics */}
      <div className="user-stats-container">
        <div className="stat-card total-users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
          </div>
        </div>
        
        <div className="stat-card admin-users">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>Administrators</h3>
            <p className="stat-number">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
        
        <div className="stat-card regular-users">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Regular Users</h3>
            <p className="stat-number">
              {users.filter(u => u.role === 'user').length}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 Search Bar and Create Admin Button */}
      <div className="search-create-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button 
          className="create-admin-btn"
          onClick={() => {
            setShowCreateAdmin(true);
            setOtpStep(1);
            setOtp("");
            setNewAdminData({ email: "", password: "", confirmPassword: "" });
          }}
        >
          ➕ Create New Admin
        </button>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="modal-overlay">
          <div className="modal-large">
            <button 
              className="close-btn" 
              onClick={() => {
                setShowCreateAdmin(false);
                setNewAdminData({ email: "", password: "", confirmPassword: "" });
                setShowPassword(false);
                setShowConfirm(false);
                setOtpStep(1);
                setOtp("");
                setOtpTimer(0);
              }}
            >
              ✖
            </button>
            
            <h2>Create Admin Account</h2>
            
            <form className="create-admin-form" onSubmit={
              otpStep === 1 ? handleSendOTP : 
              otpStep === 2 ? handleVerifyOTP : 
              handleCreateAdmin
            }>
              
              {/* Step 1: Enter email */}
              {otpStep === 1 && (
                <>
                  <div className="form-step-indicator">
                    <div className="step active">1</div>
                    <div className="step-line"></div>
                    <div className="step">2</div>
                    <div className="step-line"></div>
                    <div className="step">3</div>
                  </div>
                  
                  <h3 style={{ textAlign: 'center', color: '#004d00', marginBottom: '10px' }}>
                    Step 1: Enter Admin Email
                  </h3>
                  <p className="step-description">We'll send a verification code to this email address.</p>
                  
                  <input
                    type="email"
                    placeholder="Enter admin email address"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                    required
                  />
                  
                  <div className="modal-buttons">
                    <button 
                      className="save-btn" 
                      type="submit"
                    >
                      Send Verification Code
                    </button>
                    <button 
                      className="cancel-btn" 
                      type="button"
                      onClick={() => {
                        setShowCreateAdmin(false);
                        setNewAdminData({ email: "", password: "", confirmPassword: "" });
                        setOtpStep(1);
                        setOtp("");
                        setShowPassword(false);
                        setShowConfirm(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Verify OTP */}
              {otpStep === 2 && (
                <>
                  <div className="form-step-indicator">
                    <div className="step completed">✓</div>
                    <div className="step-line completed"></div>
                    <div className="step active">2</div>
                    <div className="step-line"></div>
                    <div className="step">3</div>
                  </div>
                  
                  <h3 style={{ textAlign: 'center', color: '#004d00', marginBottom: '10px' }}>
                    Step 2: Verify Email
                  </h3>
                  <p className="step-description">
                    Enter the 6-digit code sent to <strong>{newAdminData.email}</strong>
                  </p>
                  
                  <div className="otp-input-container">
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
                      className="otp-input"
                    />
                  </div>
                  
                  <div className="otp-info">
                    {otpTimer > 0 ? (
                      <p className="otp-timer">
                        ⏰ Code expires in: {formatOtpTime(otpTimer)}
                      </p>
                    ) : (
                      <p className="otp-timer-expired">⌛ Code expired</p>
                    )}
                    <p>Attempts left: {otpAttemptsLeft}</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResendDisabled}
                    className="resend-otp-btn"
                  >
                    {isResendDisabled ? `Resend in 60s` : "Resend Code"}
                  </button>
                  
                  <div className="modal-buttons">
                    <button 
                      className="back-btn" 
                      type="button"
                      onClick={() => {
                        setOtpStep(1);
                        setOtp("");
                      }}
                    >
                      ← Back
                    </button>
                    <button 
                      className="save-btn" 
                      type="submit"
                    >
                      Verify Code
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Enter password */}
              {otpStep === 3 && (
                <>
                  <div className="form-step-indicator">
                    <div className="step completed">✓</div>
                    <div className="step-line completed"></div>
                    <div className="step completed">✓</div>
                    <div className="step-line completed"></div>
                    <div className="step active">3</div>
                  </div>
                  
                  <h3 style={{ textAlign: 'center', color: '#004d00', marginBottom: '10px' }}>
                    Step 3: Set Admin Password
                  </h3>
                  <p className="step-description">
                    Email verified: <strong>{newAdminData.email}</strong>
                  </p>
                  
                  {/* PASSWORD FIELD */}
                  <div className="password-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password (min. 8 characters)"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                      required
                    />
                    <i
                      className={`fa-solid ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      } toggle-icon`}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>

                  {/* ⚠️ Real-time password requirement message */}
                  {newAdminData.password.length > 0 && newAdminData.password.length < 8 && (
                    <p className="password-error">
                      Password must be at least 8 characters long.
                    </p>
                  )}

                  {/* CONFIRM PASSWORD FIELD */}
                  <div className="password-container">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={newAdminData.confirmPassword}
                      onChange={(e) => setNewAdminData({...newAdminData, confirmPassword: e.target.value})}
                      required
                    />
                    <i
                      className={`fa-solid ${
                        showConfirm ? "fa-eye-slash" : "fa-eye"
                      } toggle-icon`}
                      onClick={() => setShowConfirm(!showConfirm)}
                    ></i>
                  </div>

                  {/* ⚠️ Real-time confirm password mismatch */}
                  {newAdminData.confirmPassword.length > 0 &&
                    newAdminData.confirmPassword !== newAdminData.password && (
                      <p className="password-error">
                        Passwords do not match.
                      </p>
                    )}

                  <div className="modal-buttons">
                    <button 
                      className="back-btn" 
                      type="button"
                      onClick={() => {
                        setOtpStep(2);
                        setOtp("");
                      }}
                    >
                      ← Back
                    </button>
                    <button 
                      className="save-btn" 
                      type="submit"
                    >
                      Create Admin Account
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 🧾 Users Table */}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
