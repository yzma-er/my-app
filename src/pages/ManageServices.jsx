// src/pages/ManageServices.jsx - UPDATED WITH EMAILJS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import EditServiceModal from "./EditServiceModal";
import "./ManageServices.css";

function ManageServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const navigate = useNavigate();

  // ✅ Auto-detect backend
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

  // ✅ Get all user emails for notification
  const getAllUserEmails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const users = await res.json();
        // Filter only user emails (not admins)
        return users
          .filter(user => user.role === 'user' && user.email)
          .map(user => user.email);
      }
      return [];
    } catch (err) {
      console.error("❌ Error fetching user emails:", err);
      return [];
    }
  };

  // ✅ Send email notification via EmailJS
  const sendEmailNotification = async (serviceName) => {
    setSendingEmails(true);
    
    try {
      // Get user emails
      const userEmails = await getAllUserEmails();
      
      if (userEmails.length === 0) {
        console.log("⚠️ No user emails found to send notifications");
        setSendingEmails(false);
        return false;
      }

      console.log(`📧 Sending notifications to ${userEmails.length} users...`);

      // Get admin email from token
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split('.')[1]));
      const adminEmail = payload.email || "Administrator";

      // Send to each user (EmailJS has limits, consider batching)
      const successfulSends = [];
      const failedSends = [];

      for (const userEmail of userEmails.slice(0, 10)) { // Limit to 10 for demo
        try {
          await emailjs.send(
            'service_272iigq', 
            'template_4rlwtmh', 
            {
              service_name: serviceName,
              user_email: userEmail,
              admin_email: adminEmail,
              date_added: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              frontend_url: window.location.origin,
              to_email: userEmail,
            },
            'nZ7vZJT3MytIs9BqH' 
          );
          
          successfulSends.push(userEmail);
          console.log(`✅ Email sent to: ${userEmail}`);
          
        } catch (emailError) {
          console.error(`❌ Failed to send to ${userEmail}:`, emailError);
          failedSends.push(userEmail);
        }
      }

      console.log(`📊 Email results: ${successfulSends.length} successful, ${failedSends.length} failed`);
      setSendingEmails(false);
      
      return successfulSends.length > 0;
      
    } catch (error) {
      console.error("❌ Error in email notification process:", error);
      setSendingEmails(false);
      return false;
    }
  };

  // ✅ Add new service WITH EMAIL NOTIFICATION
  const handleAddService = async () => {
    if (newService.trim() === "") return alert("Please enter a service name.");

    if (sendingEmails) {
      alert("Please wait, emails are being sent...");
      return;
    }

    // First, add the service
    const res = await fetch(`${backendURL}/api/admin/services`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name: newService }),
    });

    if (res.ok) {
      const result = await res.json();
      
      // Ask admin if they want to send notifications
      if (window.confirm("✅ Service added successfully!\n\nDo you want to send email notifications to all users about this new service?")) {
        
        // Show sending progress
        alert(`📧 Sending email notifications to users about "${newService}"...`);
        
        // Send email notifications
        const notificationSent = await sendEmailNotification(newService);
        
        if (notificationSent) {
          alert("✅ Email notifications sent successfully!");
        } else {
          alert("⚠️ Service added, but email notifications failed. You can try again later.");
        }
      }
      
      // Refresh the page
      window.location.reload();
      
    } else {
      const error = await res.json();
      alert(error.message || "❌ Failed to add service.");
    }
  };

  // ✅ Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    await fetch(`${backendURL}/api/admin/services/${id}`, { 
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
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
      
      {/* Email Status Indicator */}
      {sendingEmails && (
        <div className="email-sending-status">
          <div className="email-spinner"></div>
          <span>Sending email notifications to users...</span>
        </div>
      )}

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
          placeholder="Enter new service name"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          disabled={sendingEmails}
        />
        <button 
          className="add-btn" 
          onClick={handleAddService}
          disabled={sendingEmails}
        >
          {sendingEmails ? (
            <>
              <span className="btn-spinner"></span>
              Sending...
            </>
          ) : (
            <>
              <span style={{marginRight: '8px'}}>📧</span>
              + Add & Notify
            </>
          )}
        </button>
      </div>

      {/* Info box about email notifications */}
      <div className="email-notification-info">
        <strong>📧 Email Notifications:</strong>
        <p>When you add a new service, you'll be asked if you want to send email notifications to all users.</p>
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
