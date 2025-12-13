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
  const [overallRating, setOverallRating] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [showRatings, setShowRatings] = useState(false);
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

  const handleStepRatingSubmit = async (stepNumber) => {
    const rating = userRatings[stepNumber] || 0;
    const comment = userComments[stepNumber] || "";

    if (rating === 0) {
      alert(`Please select a star rating for Step ${stepNumber} before submitting.`);
      return;
    }

    try {
      const user_id = getUserId();
      
      const res = await axios.post(`${backendURL}/api/feedback`, {
        service_id: service?.service_id,
        service_name: service?.name || null,
        step_number: stepNumber,
        rating,
        comment: comment,
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
      
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  };

  const handleOverallRatingSubmit = async () => {
    if (overallRating === 0) {
      alert("Please select an overall star rating before submitting.");
      return;
    }

    try {
      const user_id = getUserId();
      
      const res = await axios.post(`${backendURL}/api/feedback`, {
        service_id: service?.service_id,
        service_name: service?.name || null,
        step_number: 0, // 0 indicates overall service rating
        rating: overallRating,
        comment: overallFeedback,
        user_id: user_id
      });

      if (res.data.updated) {
        alert("✅ Overall rating updated successfully!");
      } else {
        alert("✅ Overall feedback submitted successfully!");
      }
      
      setOverallRating(0);
      setOverallFeedback("");
      
      // Refresh feedback data
      fetchStepFeedbacks();
      
    } catch (err) {
      console.error("❌ Error submitting overall feedback:", err);
      alert("Failed to submit overall feedback.");
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

  // Calculate average rating for a specific step
  const calculateStepAverageRating = (stepNumber) => {
    const feedbacks = stepFeedbacks[stepNumber];
    if (!feedbacks || feedbacks.length === 0) return "N/A";
    
    const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  };

  // Calculate overall service average rating
  const calculateOverallAverageRating = () => {
    const allFeedbacks = Object.values(stepFeedbacks).flat();
    if (allFeedbacks.length === 0) return "N/A";
    
    const total = allFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / allFeedbacks.length).toFixed(1);
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

      {/* SHOW ALL STEPS - NO UNLOCKING */}
      <div className="all-steps-container">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const stepAverageRating = calculateStepAverageRating(stepNum);
          const stepFeedbacksList = stepFeedbacks[stepNum] || [];

          return (
            <div key={index} className="info-section" style={{ marginBottom: "25px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ color: "#1C7C0F", margin: 0 }}>
                  Step {stepNum}: {step.customName ? `${step.title} - ${step.customName}` : step.title}
                </h3>
                <div style={{ 
                  background: "#eaf4ea", 
                  padding: "5px 10px", 
                  borderRadius: "15px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1C7C0F"
                }}>
                  ⭐ Avg: {stepAverageRating} ({stepFeedbacksList.length} ratings)
                </div>
              </div>
              
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
                { whiteSpace: "pre-line", marginBottom: "15px" }
              )}

              {step.formFile && (
                <div style={{ marginTop: "10px", marginBottom: "20px" }}>
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

              {/* Rate this step section */}
              <div className="feedback-section" style={{ marginTop: "20px" }}>
                <h4>Rate this step:</h4>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= (userRatings[stepNum] || 0) ? "active" : ""}`}
                      onClick={() => setUserRatings(prev => ({ ...prev, [stepNum]: star }))}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  placeholder={`Write your feedback for Step ${stepNum} (optional)...`}
                  value={userComments[stepNum] || ""}
                  onChange={(e) => setUserComments(prev => ({ ...prev, [stepNum]: e.target.value }))}
                  style={{ marginTop: "10px" }}
                />

                <button 
                  className="feedback-btn" 
                  onClick={() => handleStepRatingSubmit(stepNum)}
                  style={{ marginTop: "10px" }}
                >
                  Submit Rating for Step {stepNum}
                </button>
              </div>

              {/* Show previous feedbacks for this step */}
              {stepFeedbacksList.length > 0 && (
                <div style={{ 
                  marginTop: "20px", 
                  background: "#f8f9fa", 
                  padding: "15px", 
                  borderRadius: "10px",
                  border: "1px solid #dee2e6"
                }}>
                  <h5 style={{ color: "#6c757d", marginBottom: "10px" }}>
                    Previous ratings for this step ({stepFeedbacksList.length}):
                  </h5>
                  <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                    {stepFeedbacksList.map((fb, idx) => (
                      <div key={idx} style={{ 
                        padding: "8px", 
                        borderBottom: "1px solid #e9ecef",
                        fontSize: "14px"
                      }}>
                        <div>
                          <span style={{ color: "#1C7C0F", fontWeight: "bold" }}>⭐ {fb.rating}/5</span>
                          {fb.comment && (
                            <span style={{ marginLeft: "10px", color: "#495057" }}>"{fb.comment}"</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "3px" }}>
                          {new Date(fb.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OVERALL SERVICE RATING SECTION - AT THE BOTTOM */}
      <div className="overall-rating-section" style={{ 
        marginTop: "40px", 
        padding: "25px", 
        background: "linear-gradient(135deg, #eaf4ea 0%, #d4eed4 100%)",
        borderRadius: "15px",
        width: "100%",
        border: "2px solid #1C7C0F"
      }}>
        <h3 style={{ 
          color: "#1C7C0F", 
          textAlign: "center", 
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px"
        }}>
          <i className="fas fa-chart-line"></i>
          Overall Service Rating
        </h3>

        <div style={{ 
          textAlign: "center", 
          marginBottom: "25px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#104C08"
        }}>
          ⭐ Average Rating: {calculateOverallAverageRating()}/5
        </div>

        <div className="feedback-section" style={{ background: "transparent" }}>
          <h4>Rate the overall service:</h4>

          <div className="star-rating" style={{ fontSize: "2rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= overallRating ? "active" : ""}`}
                onClick={() => setOverallRating(star)}
                style={{ margin: "0 8px", cursor: "pointer" }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your overall feedback about this service..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            style={{ marginTop: "15px", minHeight: "100px" }}
          />

          <button 
            className="feedback-btn" 
            onClick={handleOverallRatingSubmit}
            style={{ 
              marginTop: "15px",
              background: "#104C08",
              fontSize: "16px",
              padding: "12px 30px"
            }}
          >
            Submit Overall Rating
          </button>
        </div>

        {/* Toggle to view all ratings */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => setShowRatings(!showRatings)}
            style={{
              background: "transparent",
              color: "#1C7C0F",
              border: "2px solid #1C7C0F",
              borderRadius: "25px",
              padding: "8px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {showRatings ? 'Hide All Ratings' : 'View All Ratings'}
            <i className={`fas fa-chevron-${showRatings ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {/* Show all ratings when toggled */}
        {showRatings && (
          <div style={{ 
            marginTop: "25px", 
            background: "white", 
            padding: "20px", 
            borderRadius: "10px",
            border: "1px solid #bde3b2"
          }}>
            <h4 style={{ color: "#1C7C0F", marginBottom: "15px" }}>All Service Ratings:</h4>
            {Object.entries(stepFeedbacks).map(([stepNum, feedbacks]) => (
              <div key={stepNum} style={{ marginBottom: "15px" }}>
                <h5 style={{ color: "#104C08" }}>
                  Step {stepNum}: {calculateStepAverageRating(stepNum)}/5 ({feedbacks.length} ratings)
                </h5>
                <div style={{ maxHeight: "120px", overflowY: "auto", padding: "10px", background: "#f8f9fa", borderRadius: "8px" }}>
                  {feedbacks.map((fb, idx) => (
                    <div key={idx} style={{ 
                      padding: "5px 0", 
                      borderBottom: "1px solid #e9ecef",
                      fontSize: "13px"
                    }}>
                      <span style={{ color: "#1C7C0F" }}>⭐ {fb.rating}/5</span>
                      {fb.comment && (
                        <span style={{ marginLeft: "10px", color: "#495057" }}>"{fb.comment}"</span>
                      )}
                      <div style={{ fontSize: "11px", color: "#6c757d", marginTop: "2px" }}>
                        {new Date(fb.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceDetails;
