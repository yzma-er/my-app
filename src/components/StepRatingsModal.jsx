// src/components/StepRatingsModal.jsx
import React, { useEffect, useState } from "react";
import "./StepRatingsModal.css";
import axios from "axios";

function StepRatingsModal({ open, onClose, serviceName, serviceId, stepRatings, serviceInfo }) {
  
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  const [stepTitles, setStepTitles] = useState({});

  // ⭐ Load step titles from service content JSON
  useEffect(() => {
    if (!serviceId) return;

    const fetchService = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/services/${serviceId}`);
        let steps = [];

        try {
          steps = JSON.parse(res.data.content || "[]");
        } catch {
          steps = [];
        }

        // Map step numbers → titles
        const titles = {};
        steps.forEach((step, index) => {
          titles[index + 1] = step.title || `Step ${index + 1}`;
        });

        setStepTitles(titles);
      } catch (err) {
        console.error("❌ Error loading step titles:", err);
      }
    };

    fetchService();
  }, [serviceId, backendURL]);

  if (!open) return null;

  return (
    <div className="ratings-modal-overlay">
      <div className="ratings-modal">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>📊 Step Ratings: {serviceName}</h2>

        <div className="step-ratings-list">
          {stepRatings.length > 0 ? (
            stepRatings.map((r, idx) => (
              <div key={idx} className="step-rating-card">
                <h3>{stepTitles[r.step_number] || `Step ${r.step_number}`}</h3>
                <p>⭐ {r.avg_rating} ({r.count} ratings)</p>
              </div>
            ))
          ) : (
            <p>No ratings available for this service.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepRatingsModal;
