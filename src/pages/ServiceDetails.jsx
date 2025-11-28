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

  const THREE_DAYS_MS = useMemo(() => 3 * 24 * 60 * 60 * 1000, []);

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
      const now = Date.now();

      if (now - data.timestamp < THREE_DAYS_MS) {
        setCurrentStep(data.currentStep);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setCurrentStep(1);
      }
    }
  }, [STORAGE_KEY, THREE_DAYS_MS]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentStep,
        timestamp: Date.now(),
      })
    );
  }, [currentStep, STORAGE_KEY]);

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }

    try {
      await axios.post(`${backendURL}/api/feedback`, {
        service_id: service?.service_id,
        service_name: service?.name || null,
        step_number: currentStep,
        rating,
        comment: feedback,
      });

      alert("✅ Feedback submitted successfully!");
      setRating(0);
      setFeedback("");
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress?")) {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentStep(1);
      alert("🔁 Progress has been reset!");
    }
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
        }}
      >
        ← Back to Services
      </button>

      <h2 style={{ color: "#1C7C0F", marginBottom: "10px" }}>{service.name}</h2>

      {service.description && (
        <p
          className="service-description"
          style={{
            marginBottom: "20px",
            whiteSpace: "pre-line",
            textAlign: "justify",
          }}
        >
          {service.description}
        </p>
      )}

      {service.description2 && <p className="service-description2">{service.description2}</p>}

      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isUnlocked = stepNum <= currentStep;
        if (!isUnlocked) return null;

        return (
          <div key={index} className="info-section" style={{ marginBottom: "25px" }}>
            {/* ✅ Show step title with custom name */}
            <h3 style={{ color: "#1C7C0F" }}>
              {step.customName ? `${step.title} - ${step.customName}` : step.title}
            </h3>
            
            {/* 🎥 Video for each step - RESPONSIVE */}
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

            <p style={{ whiteSpace: "pre-line" }}>{step.content}</p>

            {step.formFile && (
              <div style={{ marginTop: "10px" }}>
                <a
                  href={`${backendURL}/forms/${step.formFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                {/* ✅ Update feedback title to include custom name */}
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
              </div>
            )}
          </div>
        );
      })}

      {currentStep > steps.length && (
        <div className="info-section" style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>🎉 You've completed all steps for this service!</h3>
          <p style={{ color: "#1C7C0F" }}>
            You can reset your progress if you wish to start again.
          </p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "30px" }}>
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
