// src/pages/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  // ✅ Change role
  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === id ? { ...u, role: newRole } : u))
        );
        alert("✅ Role updated successfully!");
      } else {
        alert("❌ Failed to update role");
      }
    } catch (err) {
      console.error("❌ Error updating role:", err);
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
      <h1>👥 Manage Users</h1>

      {/* 🔍 Search Bar */}
      <div className="search-container" style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            width: "300px",
            borderRadius: "25px",
            border: "1px solid #ccc",
          }}
        />
      </div>

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
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
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
