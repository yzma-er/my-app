// src/pages/ManageServices.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditServiceModal from "./EditServiceModal";
import "./ManageServices.css";

function ManageServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const navigate = useNavigate();

  // ✅ Auto-detect backend (Laptop vs. Phone)
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ✅ Fetch all services
  useEffect(() => {
    fetch(`${backendURL}/api/services`)
      .then((res) => res.json())
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [backendURL]);

  // ✅ Add new service
  const handleAddService = async () => {
    if (newService.trim() === "") return alert("Please enter a service name.");

    const res = await fetch(`${backendURL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newService }),
    });

    if (res.ok) {
      alert("✅ Service added successfully!");
      window.location.reload();
    } else {
      alert("❌ Failed to add service.");
    }
  };

  // ✅ Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    await fetch(`${backendURL}/api/services/${id}`, { method: "DELETE" });
    setServices(services.filter((s) => s.service_id !== id));
  };

  // ✅ Refresh list after saving edits
  const handleServiceUpdated = async () => {
    setEditingServiceId(null);
    const res = await fetch(`${backendURL}/api/services`);
    const data = await res.json();
    setServices(data);
  };

  return (
    <div className="manage-container">
      
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

      <h1>Manage Services</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        services.map((service) => (
          <div key={service.service_id} className="service-item">
            <div className="service-info">
              <strong>{service.name}</strong>
              <p>{service.description}</p>
            </div>
            <div className="button-group">
              <button
                className="edit-btn"
                onClick={() => setEditingServiceId(service.service_id)}
              >
                ✏️ Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(service.service_id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* Add new service */}
      <div className="service-item add-service-row">
        <input
          type="text"
          placeholder="Enter new service"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
        />
        <button className="add-btn" onClick={handleAddService}>
          + Add
        </button>
      </div>

      {/* ✅ Edit Modal appears here */}
      {editingServiceId && (
        <EditServiceModal
          serviceId={editingServiceId}
          onClose={() => setEditingServiceId(null)}
          onSave={handleServiceUpdated}
        />
      )}
    </div>
  );
}

export default ManageServices;
