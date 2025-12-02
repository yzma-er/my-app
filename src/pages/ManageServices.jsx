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
      setNewService(""); // Clear the input
      // Refresh services
      const updatedRes = await fetch(`${backendURL}/api/services`);
      const updatedData = await updatedRes.json();
      setServices(updatedData);
    } else {
      alert("❌ Failed to add service.");
    }
  };

  // ✅ Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    const res = await fetch(`${backendURL}/api/services/${id}`, { 
      method: "DELETE" 
    });
    if (res.ok) {
      setServices(services.filter((s) => s.service_id !== id));
    } else {
      alert("Failed to delete service.");
    }
  };

  // ✅ Refresh list after saving edits
  const handleServiceUpdated = async () => {
    setEditingServiceId(null);
    const res = await fetch(`${backendURL}/api/services`);
    const data = await res.json();
    setServices(data);
  };

  // ✅ Handle Enter key for adding service
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddService();
    }
  };

  return (
    <div className="manage-container">
      
      {/* Back button with class only - removed inline styles */}
      <div className="back-button-container">
        <button
          className="back-admin-btn"
          onClick={() => navigate("/admin")}
        >
          <span className="back-arrow">←</span> Back to Admin
        </button>
      </div>

      <h1>Manage Services</h1>

      {loading ? (
        <div className="loading-container">
          <p>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="no-services">
          <p>No services found. Add your first service below!</p>
        </div>
      ) : (
        <div className="services-list">
          {services.map((service) => (
            <div key={service.service_id} className="service-item">
              <div className="service-info">
                <strong>{service.name}</strong>
                <p>{service.description || "No description available"}</p>
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
          ))}
        </div>
      )}

      {/* Add new service */}
      <div className="add-service-container">
        <div className="add-service-row">
          <input
            type="text"
            placeholder="Enter new service name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="add-btn" onClick={handleAddService}>
            + Add Service
          </button>
        </div>
        <p className="add-service-hint">Press Enter or click "Add Service" to save</p>
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
