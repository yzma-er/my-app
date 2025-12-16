import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

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
  const navigate = useNavigate();

  // ✅ Auto-detect backend (Laptop vs. Phone)
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ✅ Stats calculation
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length
  };

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

  // ✅ Create Admin Account
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
        setNewAdminData({ email: "", password: "", confirmPassword: "" });
        setShowCreateAdmin(false);
        
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

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>Regular Users</p>
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
          onClick={() => setShowCreateAdmin(true)}
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
              }}
            >
              ✖
            </button>
            
            <h2>Create Admin Account</h2>
            
            <form className="create-admin-form" onSubmit={handleCreateAdmin}>
              <input
                type="email"
                placeholder="Admin email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                required
              />

              {/* PASSWORD FIELD */}
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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
                <p style={{ color: "red", fontSize: "13px", marginBottom: "6px" }}>
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
                  <p style={{ color: "red", fontSize: "13px", marginBottom: "6px" }}>
                    Passwords do not match.
                  </p>
                )}

              <div className="modal-buttons">
                <button 
                  className="save-btn" 
                  type="submit"
                >
                  Create Admin
                </button>
                <button 
                  className="cancel-btn" 
                  type="button"
                  onClick={() => {
                    setShowCreateAdmin(false);
                    setNewAdminData({ email: "", password: "", confirmPassword: "" });
                    setShowPassword(false);
                    setShowConfirm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
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
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.email}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`role-badge ${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {new Date(u.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
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
