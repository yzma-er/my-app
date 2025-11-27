// src/pages/ManageUsers.jsx
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
    password: ""
  });
  const navigate = useNavigate();

  // ✅ Auto-detect backend (Laptop vs. Phone)
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
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        alert("Failed to load users. Please ensure you are logged in as admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backendURL]);

  // ✅ Filtered users based on search
  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Create Admin Account
  const handleCreateAdmin = async () => {
    if (!newAdminData.email || !newAdminData.password) {
      alert("Please enter both email and password.");
      return;
    }

    if (newAdminData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
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

      if (res.ok) {
        alert("✅ Admin account created successfully!");
        setNewAdminData({ email: "", password: "" });
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
        const error = await res.json();
        alert(`❌ Failed to create admin: ${error.message || "Unknown error"}`);
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
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
          ➕ Create Admin
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
                setNewAdminData({ email: "", password: "" });
              }}
            >
              ✖
            </button>
            
            <h2>Create Admin Account</h2>
            
            <div className="create-admin-form">
              <input
                type="email"
                placeholder="Admin email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
              />
              <input
                type="password"
                placeholder="Admin password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
              />
              
              <div className="modal-buttons">
                <button 
                  className="save-btn" 
                  onClick={handleCreateAdmin}
                >
                  Create Admin
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowCreateAdmin(false);
                    setNewAdminData({ email: "", password: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Users Table */}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.email}</td>
                <td>
                  <span className="role-badge">{u.role}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(u.user_id)}
                    >
                      Delete
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handlePasswordChange(u.user_id)}
                    >
                      Change Password
                    </button>
                  </div>
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
