// src/pages/ServiceDetails.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./Services.css";
import { useNavigate } from "react-router-dom";

function ServiceDetails() {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState({}); // Store ratings for each step
  const [userComments, setUserComments] = useState({}); // Store comments for each step
  const [stepFeedbacks, setStepFeedbacks] = useState({}); // Store all feedback for each step
  const [errors, setErrors] = useState({}); // Store validation errors
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

  const fetchStepFeedbacks = useCallback(async () => {
    try {
      if (!service) return;
      
      const res = await axios.get(`${backendURL}/api/feedback/service/${serviceId}`);
      
      // Organize feedback by step number
      const feedbackByStep = {};
      res.data.forEach(feedback => {
        if (!feedbackByStep[feedback.step_number]) {
          feedbackByStep[feedback.step_number] = [];
        }
        feedbackByStep[feedback.step_number].push(feedback);
      });
      
      setStepFeedbacks(feedbackByStep);
    } catch (err) {
      console.error("❌ Error fetching step feedbacks:", err);
    }
  }, [backendURL, serviceId, service]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  useEffect(() => {
    if (service) {
      fetchStepFeedbacks();
    }
  }, [service, fetchStepFeedbacks]);

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

  const validateStepRating = (stepNumber) => {
    const rating = userRatings[stepNumber] || 0;
    const comment = userComments[stepNumber] || "";
    const newErrors = { ...errors };

    // Clear previous error
    delete newErrors[stepNumber];

    // Validate rating
    if (rating === 0) {
      newErrors[stepNumber] = "Please select a star rating.";
      setErrors(newErrors);
      return false;
    }

    // Validate comment (required)
    if (!comment.trim()) {
      newErrors[stepNumber] = "Please write a comment explaining your rating.";
      setErrors(newErrors);
      return false;
    }

    // Validate comment length
    if (comment.trim().length < 10) {
      newErrors[stepNumber] = "Please write a more detailed comment (at least 10 characters).";
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return true;
  };

  const handleStepRatingSubmit = async (stepNumber) => {
    // Validate input
    if (!validateStepRating(stepNumber)) {
      return;
    }

    const rating = userRatings[stepNumber];
    const comment = userComments[stepNumber];

    try {
      const user_id = getUserId();
      
      const res = await axios.post(`${backendURL}/api/feedback`, {
        service_id: service?.service_id,
        service_name: service?.name || null,
        step_number: stepNumber,
        rating,
        comment: comment.trim(),
        user_id: user_id
      });

      if (res.data.updated) {
        alert(`✅ Rating updated for Step ${stepNumber}!`);
      } else {
        alert(`✅ Feedback submitted for Step ${stepNumber}!`);
      }
      
      // Refresh feedback data
      fetchStepFeedbacks();
      
      // Clear individual step rating/comment
      setUserRatings(prev => ({ ...prev, [stepNumber]: 0 }));
      setUserComments(prev => ({ ...prev, [stepNumber]: "" }));
      setErrors(prev => ({ ...prev, [stepNumber]: undefined }));
      
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("Failed to submit feedback.");
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

      {/* SHOW ALL STEPS */}
      <div className="all-steps-container">
        <h2 style={{ 
          color: "#1C7C0F", 
          margin: "30px 0 20px 0", 
          textAlign: "center",
          borderBottom: "2px solid #bde3b2",
          paddingBottom: "10px"
        }}>
          <i className="fas fa-list-ol"></i> Service Steps
        </h2>
        
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const stepFeedbacksList = stepFeedbacks[stepNum] || [];

          return (
            <div key={index} className="info-section" style={{ 
              marginBottom: "30px", 
              width: "100%",
              padding: "20px",
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "15px",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <h3 style={{ color: "#1C7C0F", margin: 0, fontSize: "1.3rem" }}>
                  <span style={{
                    background: "#1C7C0F",
                    color: "white",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "10px",
                    fontSize: "14px"
                  }}>
                    {stepNum}
                  </span>
                  {step.customName ? `${step.title} - ${step.customName}` : step.title}
                </h3>
              </div>
              
              {step.videoFile && (
                <div style={{ 
                  marginTop: "15px", 
                  marginBottom: "20px",
                  width: "100%"
                }}>
                  <div style={{
                    width: "100%",
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
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
                { 
                  whiteSpace: "pre-line", 
                  marginBottom: "20px",
                  lineHeight: "1.6",
                  fontSize: "16px"
                }
              )}

              {step.formFile && (
                <div style={{ 
                  marginTop: "10px", 
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <a
                    href={step.formFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={step.originalFormName || "form"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: "#1C7C0F",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "25px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      gap: "8px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#104C08";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#1C7C0F";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <i className="fas fa-download"></i>
                    Download Form
                  </a>
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {step.originalFormName && `(${step.originalFormName})`}
                  </span>
                </div>
              )}

              {/* Rate this step section */}
              <div className="feedback-section" style={{ 
                marginTop: "25px", 
                padding: "20px",
                background: "#f8fff8",
                borderRadius: "10px",
                border: "1px solid #bde3b2"
              }}>
                <h4 style={{ color: "#1C7C0F", marginBottom: "15px", textAlign: "center" }}>
                  <i className="fas fa-edit"></i> Rate This Step
                </h4>

                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= (userRatings[stepNum] || 0) ? "active" : ""}`}
                        onClick={() => {
                          setUserRatings(prev => ({ ...prev, [stepNum]: star }));
                          // Clear error when rating is selected
                          if (errors[stepNumber]) {
                            setErrors(prev => ({ ...prev, [stepNum]: undefined }));
                          }
                        }}
                        style={{ fontSize: "2.2rem", margin: "0 5px", cursor: "pointer" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                    {userRatings[stepNum] ? `Selected: ${userRatings[stepNum]}/5` : "Click stars to rate (required)"}
                  </div>
                </div>

                <div style={{ marginTop: "15px" }}>
                  <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                    <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                      Your Comment: <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {userComments[stepNum]?.length || 0}/500 characters
                    </span>
                  </div>
                  <textarea
                    placeholder={`Please explain your rating for Step ${stepNum} (required, minimum 10 characters)...`}
                    value={userComments[stepNum] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setUserComments(prev => ({ ...prev, [stepNum]: value }));
                        // Clear error when user starts typing
                        if (errors[stepNum] && value.trim().length >= 10) {
                          setErrors(prev => ({ ...prev, [stepNum]: undefined }));
                        }
                      }
                    }}
                    style={{ 
                      width: "100%",
                      minHeight: "100px",
                      border: errors[stepNum] ? "1px solid #dc2626" : "1px solid #bde3b2",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "15px",
                      resize: "vertical",
                      backgroundColor: errors[stepNum] ? "#fef2f2" : "white"
                    }}
                  />
                  {errors[stepNum] && (
                    <div style={{ 
                      color: "#dc2626", 
                      fontSize: "14px", 
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      <i className="fas fa-exclamation-circle"></i>
                      {errors[stepNum]}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                    <i className="fas fa-info-circle"></i> Comments help us improve our services. Please be specific about your experience.
                  </div>
                </div>

                <button 
                  className="feedback-btn" 
                  onClick={() => handleStepRatingSubmit(stepNum)}
                  style={{ 
                    marginTop: "20px",
                    width: "100%",
                    background: (userRatings[stepNum] && userComments[stepNum]?.trim().length >= 10) ? "#1C7C0F" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "12px",
                    cursor: (userRatings[stepNum] && userComments[stepNum]?.trim().length >= 10) ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                  disabled={!(userRatings[stepNum] && userComments[stepNum]?.trim().length >= 10)}
                >
                  <i className="fas fa-paper-plane"></i> Submit Rating for Step {stepNum}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ServiceDetails;
