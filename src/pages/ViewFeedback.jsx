// src/pages/ViewFeedback.jsx - UPDATED to show user emails
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewFeedback.css";
import StepRatingsModal from "../components/StepRatingsModal";

function ViewFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("All Services");
  const navigate = useNavigate();

  // For modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stepRatings, setStepRatings] = useState([]);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // memoized fetch functions to satisfy eslint rules
  const fetchFeedback = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/feedback`);
      setFeedback(res.data);
    } catch (err) {
      console.error("❌ Error fetching feedback:", err);
    }
  }, [backendURL]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error("❌ Error fetching services:", err);
    }
  }, [backendURL]);

  useEffect(() => {
    fetchFeedback();
    fetchServices();
  }, [fetchFeedback, fetchServices]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`${backendURL}/api/feedback/${id}`);
      fetchFeedback();
    } catch (err) {
      console.error("❌ Error deleting feedback:", err);
    }
  };

  // Filtered feedback
  const filteredFeedback =
    filter === "All Services"
      ? feedback
      : feedback.filter(
          (f) =>
            f.service_name?.trim().toLowerCase() === filter.trim().toLowerCase()
        );

  // Average rating per service (summary)
  const serviceSummary = services.map((s) => {
    const serviceFeedback = feedback.filter(
      (f) =>
        f.service_name?.trim().toLowerCase() === s.name.trim().toLowerCase()
    );

    const avg =
      serviceFeedback.length > 0
        ? (
            serviceFeedback.reduce((sum, f) => sum + f.rating, 0) /
            serviceFeedback.length
          ).toFixed(1)
        : "N/A";

    return {
      ...s,
      avg,
      count: serviceFeedback.length,
    };
  });

  // Open modal and load step ratings
  const openStepRatings = async (service) => {
    setSelectedService(service);

    try {
      const res = await axios.get(`${backendURL}/api/feedback/step-ratings/${encodeURIComponent(service.name)}`);
      setStepRatings(res.data);
    } catch (err) {
      console.error("❌ Error loading step ratings:", err);
      setStepRatings([]);
    }

    setModalOpen(true);
  };

  return (
    <div className="feedback-container">
      
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

      <h2>📋 Feedback Records</h2>

      {/* Summary Section */}
      <div className="summary-section">
        <h3>Average Ratings per Service</h3>
        <div className="summary-grid">
          {serviceSummary.map((s) => (
            <div
              key={s.service_id}
              className="summary-card"
              onClick={() => openStepRatings(s)}
              style={{ cursor: "pointer" }}
            >
              <strong>{s.name}</strong>
              <p>
                ⭐ {s.avg}{" "}
                <span style={{ fontSize: "13px", color: "#555" }}>
                  ({s.count} feedbacks)
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="filter-container">
        <label>Filter by Service:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All Services">All Services</option>
          {services.map((s) => (
            <option key={s.service_id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback Table */}
      <table className="feedback-table">
        <thead>
          <tr>
            <th>User Email</th>
            <th>Service</th>
            <th>Step</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <tr key={item.feedback_id}>
                <td>
                  {item.user_email ? (
                    <span title={`User ID: ${item.user_id}`}>
                      {item.user_email}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      Anonymous
                    </span>
                  )}
                </td>
                <td>{item.service_name || "—"}</td>
                <td>{item.step_number ? `Step ${item.step_number}` : "—"}</td>
                <td>
                  <span style={{ color: '#ffa500' }}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                    ({item.rating}/5)
                  </span>
                </td>
                <td>{item.comment || "No comment"}</td>
                <td>
                  {new Date(item.created_at).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.feedback_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No feedback available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Step Ratings Modal */}
      <StepRatingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={selectedService?.name}
        stepRatings={stepRatings}
      />
    </div>
  );
}

export default ViewFeedback;
