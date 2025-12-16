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
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });
  const navigate = useNavigate();

  // ✅ Auto-detect backend
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ✅ Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("❌ No token found. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        if (decoded.exp * 1000 < Date.now()) {
          alert("❌ Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      } catch (error) {
        alert("❌ Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          alert("❌ Access denied. Please ensure you are logged in as admin.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setUsers(data);
        
        // Calculate stats
        const admins = data.filter(u => u.role === 'admin').length;
        setStats({
          total: data.length,
          admins: admins,
          users: data.length - admins
        });
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        alert("Failed to load users. Please check your connection and try again.");
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
          
          // Update stats
          const admins = data.filter(u => u.role === 'admin').length;
          setStats({
            total: data.length,
            admins: admins,
            users: data.length - admins
          });
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
    const newPassword = prompt("Enter new password (minimum 8 characters):");
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

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
  const handleDelete = async (id) => {
    const userToDelete = users.find(u => u.user_id === id);
    if (!userToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete ${userToDelete.email}? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          [userToDelete.role === 'admin' ? 'admins' : 'users']: prev[userToDelete.role === 'admin' ? 'admins' : 'users'] - 1
        }));
        alert("🗑️ User deleted successfully!");
      } else {
        alert("❌ Failed to delete user");
      }
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  // ✅ Loading state with better UI
  if (loading) return (
    <div className="manage-users">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    </div>
  );

  return (
    <div className="manage-users">
      
      {/* Header with Back Button */}
      <div className="manage-users-header">
        <button
          className="back-admin-btn"
          onClick={() => navigate("/admin")}
        >
          ← Back to Dashboard
        </button>
        <h1>👥 User Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card admins">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
          </div>
        </div>
        
        <div className="stat-card users">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>Regular Users</p>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="search-actions-bar">
        <div className="search-box">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search users by email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button 
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="action-buttons-bar">
          <button 
            className="create-admin-btn"
            onClick={() => setShowCreateAdmin(true)}
          >
            <span className="btn-icon">➕</span>
            Create New Admin
          </button>
          <button 
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h3>All Users ({filteredUsers.length})</h3>
          {search && (
            <span className="search-results">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          )}
        </div>

        {filteredUsers.length > 0 ? (
          <div className="users-table">
            <div className="table-row header-row">
              <div className="table-cell">Email</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Joined</div>
              <div className="table-cell actions-header">Actions</div>
            </div>

            {filteredUsers.map((u) => (
              <div className="table-row user-row" key={u.user_id}>
                <div className="table-cell email-cell">
                  <div className="user-email">
                    <span className="email-icon">📧</span>
                    {u.email}
                  </div>
                </div>
                
                <div className="table-cell role-cell">
                  <span className={`role-badge ${u.role}`}>
                    {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
                
                <div className="table-cell date-cell">
                  {new Date(u.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="table-cell actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handlePasswordChange(u.user_id)}
                      title="Change Password"
                    >
                      🔑 Change Password
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(u.user_id)}
                      title="Delete User"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-users">
            <div className="no-users-icon">📭</div>
            <h3>No users found</h3>
            <p>
              {search 
                ? `No users matching "${search}"`
                : "No users in the system"}
            </p>
            {search && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="modal-overlay">
          <div className="modal-large">
            <div className="modal-header">
              <h2>Create Admin Account</h2>
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
            </div>
            
            <div className="modal-content">
              <form className="create-admin-form" onSubmit={handleCreateAdmin}>
                <div className="form-group">
                  <label htmlFor="adminEmail">Admin Email Address</label>
                  <input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminPassword">Password</label>
                  <div className="password-container">
                    <input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {newAdminData.password.length > 0 && newAdminData.password.length < 8 && (
                    <p className="password-error">
                      ⚠️ Password must be at least 8 characters long
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-container">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={newAdminData.confirmPassword}
                      onChange={(e) => setNewAdminData({...newAdminData, confirmPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {newAdminData.confirmPassword.length > 0 &&
                    newAdminData.confirmPassword !== newAdminData.password && (
                    <p className="password-error">
                      ⚠️ Passwords do not match
                    </p>
                  )}
                </div>

                <div className="form-requirements">
                  <p><strong>Requirements:</strong></p>
                  <ul>
                    <li>✓ Valid email address</li>
                    <li>✓ Minimum 8 character password</li>
                    <li>✓ Passwords must match</li>
                    <li>✓ Admin will have full system access</li>
                  </ul>
                </div>

                <div className="modal-buttons">
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
                  <button 
                    className="save-btn" 
                    type="submit"
                    disabled={!newAdminData.email || newAdminData.password.length < 8 || newAdminData.password !== newAdminData.confirmPassword}
                  >
                    Create Admin Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
