import React from "react";
import "./StepRatingsModal.css";

function StepRatingsModal({ open, onClose, serviceName, stepRatings }) {
  if (!open) return null;

  console.log("StepRatingsModal received:", stepRatings); // Debug log

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Aesthetic Close Button */}
        <button 
          className="aesthetic-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M18 6L6 18M6 6l12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2>⭐ Step Ratings — {serviceName}</h2>

        {stepRatings.length > 0 ? (
          <ul className="step-list">
            {stepRatings.map((step, i) => (
              <li key={i} className="step-item">
                <div className="step-header">
                  <div className="step-title">
                    <strong>Step {step.step_number}</strong>
                    {step.custom_name && (
                      <span className="custom-name">— {step.custom_name}</span>
                    )}
                  </div>
                </div>
                <span className="rating-info">
                  ⭐ {step.avg_rating} ({step.count} ratings)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No ratings available for this service.</p>
        )}

        <button className="action-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default StepRatingsModal;
