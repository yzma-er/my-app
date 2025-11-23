import React from "react";
import "./StepRatingsModal.css";

function StepRatingsModal({ open, onClose, serviceName, stepRatings }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>⭐ Step Ratings — {serviceName}</h2>

        {stepRatings.length > 0 ? (
          <ul className="step-list">
            {stepRatings.map((step, i) => (
              <li key={i} className="step-item">
                <strong>Step {step.step_number}</strong>
                <span>
                  ⭐ {step.avg_rating} ({step.count})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No ratings available for this service.</p>
        )}

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default StepRatingsModal;
