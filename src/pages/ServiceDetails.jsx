// src/pages/ServiceDetails.jsx - UPDATED VERSION
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
  const [userHasRated, setUserHasRated] = useState({}); // Track if user has rated each step
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
      
      // Check if current user has rated each step
      const userId = getUserId();
      if (userId) {
        const hasRated = {};
        res.data.forEach(feedback => {
          if (feedback.user_id === userId) {
            hasRated[feedback.step_number] = true;
            // Pre-fill user's previous rating and comment
            setUserRatings(prev => ({ ...prev, [feedback.step_number]: feedback.rating }));
            setUserComments(prev => ({ ...prev, [feedback.step_number]: feedback.comment || "" }));
          }
        });
        setUserHasRated(hasRated);
      }
      
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
    const userId = getUserId();

    try {
      // Check if user has already rated this step
      const checkRes = await axios.get(`${backendURL}/api/feedback/check`, {
        params: {
          user_id: userId,
          service_id: serviceId,
          step_number: stepNumber
        }
      });

      const existingFeedback = checkRes.data;

      if (existingFeedback) {
        // Update existing feedback
        const res = await axios.put(`${backendURL}/api/feedback/${existingFeedback.feedback_id}`, {
          rating,
          comment: comment.trim(),
        });

        if (res.data.success) {
          alert(`✅ Rating updated for Step ${stepNumber}!`);
        }
      } else {
        // Create new feedback
        const res = await axios.post(`${backendURL}/api/feedback`, {
          service_id: service?.service_id,
          service_name: service?.name || null,
          step_number: stepNumber,
          rating,
          comment: comment.trim(),
          user_id: userId
        });

        if (res.data.success) {
          alert(`✅ Feedback submitted for Step ${stepNumber}!`);
        }
      }
      
      // Refresh feedback data
      fetchStepFeedbacks();
      
      // Mark that user has rated this step
      setUserHasRated(prev => ({ ...prev, [stepNumber]: true }));
      
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
      {/* ... (rest of the header code remains the same) ... */}
      
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
          const hasUserRated = userHasRated[stepNum];

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
              {/* Step header with rating status */}
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
                
                {/* Rating Status Badge */}
                {hasUserRated && (
                  <div style={{ 
                    background: "#e7f4e4", 
                    padding: "6px 12px", 
                    borderRadius: "15px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#1C7C0F",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: "1px solid #bde3b2"
                  }}>
                    <i className="fas fa-check-circle"></i>
                    You've rated this step
                  </div>
                )}
              </div>
              
              {/* Step content, video, form download (same as before) */}
              {/* ... */}
              
              {/* Rate this step section */}
              <div className="feedback-section" style={{ 
                marginTop: "25px", 
                padding: "20px",
                background: "#f8fff8",
                borderRadius: "10px",
                border: "1px solid #bde3b2"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h4 style={{ color: "#1C7C0F", margin: 0 }}>
                    <i className="fas fa-edit"></i> {hasUserRated ? 'Update Your Rating' : 'Rate This Step'}
                  </h4>
                  {hasUserRated && (
                    <span style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
                      You can update your previous rating
                    </span>
                  )}
                </div>

                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= (userRatings[stepNum] || 0) ? "active" : ""}`}
                        onClick={() => {
                          setUserRatings(prev => ({ ...prev, [stepNum]: star }));
                          // Clear error when rating is selected
                          if (errors[stepNum]) {
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
                    {hasUserRated && (
                      <span style={{ marginLeft: "10px", color: "#1C7C0F" }}>
                        <i className="fas fa-sync-alt"></i> Update available
                      </span>
                    )}
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
                    placeholder={hasUserRated 
                      ? `Update your comment for Step ${stepNum} (required, minimum 10 characters)...`
                      : `Please explain your rating for Step ${stepNum} (required, minimum 10 characters)...`}
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
                    background: (userRatings[stepNum] && userComments[stepNum]?.trim().length >= 10) ? 
                      (hasUserRated ? "#f59e0b" : "#1C7C0F") : "#ccc",
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
                  <i className={hasUserRated ? "fas fa-sync-alt" : "fas fa-paper-plane"}></i>
                  {hasUserRated ? `Update Rating for Step ${stepNum}` : `Submit Rating for Step ${stepNum}`}
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
