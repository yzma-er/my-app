// src/pages/ServiceDetails.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./Services.css";
import { useNavigate } from "react-router-dom";

function ServiceDetails() {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const serviceId = window.location.pathname.split("/").pop();

  const backendURL = useMemo(() => {
    return window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";
  }, []);

  const fetchService = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/services/${serviceId}`);
      setService(res.data);
    } catch (err) {
      console.error("❌ Error fetching service:", err);
    } finally {
      setLoading(false);
    }
  }, [backendURL, serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const STORAGE_KEY = `progress_${serviceId}`;
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setCurrentStep(data.currentStep);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentStep,
      })
    );
  }, [currentStep, STORAGE_KEY]);

  const getUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
      }
      return null;
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }

    try {
      const user_id = getUserId();
      
      const res = await axios.post(`${backendURL}/api/feedback`, {
        service_id: service?.service_id,
        service_name: service?.name || null,
        step_number: currentStep,
        rating,
        comment: feedback,
        user_id: user_id
      });

      if (res.data.updated) {
        alert("✅ Rating updated successfully!");
      } else {
        alert("✅ Feedback submitted successfully!");
      }
      
      setRating(0);
      setFeedback("");
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress?\n\nThis will clear your progress but will NOT delete your previous ratings.")) {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentStep(1);
      alert("🔁 Progress has been reset! You can now go through the steps again.");
    }
  };

  // ✅ Helper function to parse bold text (**text** to <strong>text</strong>)
  const parseBoldText = (text) => {
    if (!text) return text;
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // ✅ Helper function to render HTML safely with bold support
  const renderWithBold = (text, className = "", style = {}) => {
    const html = parseBoldText(text);
    return (
      <div 
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  if (loading) return <p>Loading...</p>;
  if (!service) return <p>❌ Service not found.</p>;

  let steps = [];
  try {
    steps = JSON.parse(service.content || "[]");
    if (!Array.isArray(steps)) steps = [];
  } catch {
    steps = [];
  }

  return (
    <div className="medical-container">
      <button
        onClick={() => navigate("/services")}
        style={{
          background: "#1C7C0F",
          color: "white",
          border: "none",
          borderRadius: "25px",
          padding: "8px 16px",
          marginBottom: "15px",
          cursor: "pointer",
          fontWeight: "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          alignSelf: "flex-start",
        }}
      >
        ← Back to Services
      </button>

      <h2 style={{ color: "#1C7C0F", marginBottom: "10px", width: "100%", textAlign: "center" }}>{service.name}</h2>

      {/* ✅ Description 1 with bold support */}
      {service.description && renderWithBold(
        service.description,
        "service-description",
        {
          marginBottom: "20px",
          whiteSpace: "pre-line",
          textAlign: "center",
          width: "100%",
        }
      )}

      {/* Service Photo Display */}
      {service.photo && (
        <div style={{ 
          width: "100%", 
          margin: "20px 0",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            border: "1px solid #bde3b2",
            borderRadius: "12px",
            padding: "15px",
            background: "#f8fff8",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
          }}>
            <img 
              src={service.photo} 
              alt={service.name} 
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "400px",
                borderRadius: "8px",
                objectFit: "contain"
              }}
            />
          </div>
        </div>
      )}

      {/* ✅ Description 2 with bold support */}
      {service.description2 && renderWithBold(
        service.description2,
        "service-description2",
        { width: "100%" }
      )}

      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isUnlocked = stepNum <= currentStep;
        if (!isUnlocked) return null;

        return (
          <div key={index} className="info-section" style={{ marginBottom: "25px", width: "100%" }}>
            <h3 style={{ color: "#1C7C0F" }}>
              {step.customName ? `${step.title} - ${step.customName}` : step.title}
            </h3>
            
            {step.videoFile && (
              <div style={{ 
                marginTop: "12px", 
                marginBottom: "15px",
                width: "100%",
                display: "flex",
                justifyContent: "center"
              }}>
                <div style={{
                  width: "100%",
                  maxWidth: "100%",
                  position: "relative"
                }}>
                  <video 
                    controls 
                    style={{ 
                      width: "100%",
                      height: "auto",
                      borderRadius: "10px",
                      maxHeight: "70vh",
                      objectFit: "contain"
                    }}
                  >
                    <source src={step.videoFile} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* ✅ Step content with bold support */}
            {renderWithBold(
              step.content,
              "",
              { whiteSpace: "pre-line" }
            )}

            {step.formFile && (
              <div style={{ marginTop: "10px" }}>
                <a
                  href={step.formFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={step.originalFormName || "form"}
                  style={{
                    display: "inline-block",
                    background: "#1C7C0F",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "25px",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  📄 Download Form
                </a>
              </div>
            )}

            {currentStep === stepNum && (
              <div className="feedback-section">
                <h3>Rate {step.customName ? `${step.title} - ${step.customName}` : step.title}</h3>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? "active" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  placeholder="Write your feedback (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />

                <button className="feedback-btn" onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </button>
                
                <p style={{ 
                  fontSize: "12px", 
                  color: "#666", 
                  marginTop: "10px",
                  fontStyle: "italic"
                }}>
                  💡 You can update your rating later by resetting progress and re-rating this step.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {currentStep > steps.length && (
        <div className="info-section" style={{ textAlign: "center", marginTop: "20px", width: "100%" }}>
          <h3>🎉 You've completed all steps for this service!</h3>
          <p style={{ color: "#1C7C0F" }}>
            You can reset your progress if you wish to start again.
          </p>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
            🔄 Resetting progress will allow you to go through the steps again and update your ratings.
          </p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "30px", width: "100%" }}>
        <button
          onClick={handleResetProgress}
          style={{
            background: "#b71c1c",
            color: "white",
            border: "none",
            borderRadius: "25px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          🔁 Reset Progress
        </button>
      </div>
    </div>
  );
}

export default ServiceDetails;
