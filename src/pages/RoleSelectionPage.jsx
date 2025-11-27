import React from "react";
import "./StepRatingsModal.css";

function StepRatingsModal({ open, onClose, serviceName, stepRatings, steps }) {
  if (!open) return null;

  // Create a mapping: step_number → step.title
  const stepTitleMap = {};
  if (Array.isArray(steps)) {
    steps.forEach((step, index) => {
      stepTitleMap[index + 1] = step.title || `Step ${index + 1}`;
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>⭐ Step Ratings for {serviceName}</h2>

        {stepRatings.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No step ratings available for this service.
          </p>
        ) : (
          <div className="step-ratings-list">
            {stepRatings.map((item) => (
              <div key={item.step_number} className="step-rating-card">
                <h3>{stepTitleMap[item.step_number]}</h3>
                <p>
                  ⭐ <strong>{item.avg_rating}</strong> ({item.count} ratings)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StepRatingsModal;
