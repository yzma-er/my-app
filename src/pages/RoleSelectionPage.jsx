// src/pages/RoleSelectionPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RoleSelectionPage.css";

import StepRatingsModal from "../components/StepRatingsModal";

function RoleSelectionPage() {
  const navigate = useNavigate();
  const images = ["/carousel1.jpg", "/carousel2.jpg", "/carousel3.jpg"];

  const [current, setCurrent] = useState(0);
  const [showRatings, setShowRatings] = useState(false);
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐ MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stepRatings, setStepRatings] = useState([]);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ⭐ FETCH SERVICES + FEEDBACK
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, f] = await Promise.all([
        axios.get(`${backendURL}/api/services`),
        axios.get(`${backendURL}/api/feedback`),
      ]);

      setServices(s.data);
      setFeedback(f.data);
    } catch (err) {
      console.error("❌ Error loading ratings:", err);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendURL]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ⭐ CAROUSEL AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // ⭐ COMPUTE AVG RATINGS
  const serviceSummary = services.map((s) => {
    const serviceFeedback = feedback.filter(
      (f) =>
        f.service_name?.trim().toLowerCase() ===
        s.name.trim().toLowerCase()
    );

    const avg =
      serviceFeedback.length > 0
        ? (
            serviceFeedback.reduce((sum, f) => sum + f.rating, 0) /
            serviceFeedback.length
          ).toFixed(1)
        : "N/A";

    return { ...s, avg, count: serviceFeedback.length };
  });

  // ⭐ OPEN MODAL + FETCH STEP RATINGS
  const openRatingsModal = async (service) => {
    try {
      const res = await axios.get(
        `${backendURL}/api/feedback/step-ratings/${service.service_id}`
      );
      setStepRatings(res.data);
    } catch (err) {
      console.error("❌ Failed to load step ratings:", err);
      setStepRatings([]);
    }

    setSelectedService(service);
    setModalOpen(true);
  };

  return (
    <div className="role-container">
      {/* ⭐ CAROUSEL */}
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Slide ${i + 1}`} className="carousel-image" />
          ))}
        </div>
      </div>

      {/* LOGO + TITLES */}
      <img src="/nvsu-logo.gif" alt="NVSU Logo" className="logo" />
      <h2>Auxiliary Services Program</h2>
      <h3>Nueva Vizcaya State University</h3>
      <p>Bayombong, Nueva Vizcaya</p>

      {/* ROLE BUTTONS */}
      <div className="button-group">
        <button onClick={() => navigate("/login?role=admin")}>Administrator</button>
        <button onClick={() => navigate("/login?role=user")}>User</button>
      </div>

      {/* TOGGLE RATINGS */}
      <button
        className="ratings-toggle-btn"
        onClick={() => setShowRatings((prev) => !prev)}
      >
        {showRatings ? "Hide Service Ratings" : "View Service Ratings"}
      </button>

      {/* RATING GRID */}
      {showRatings && (
        <>
          {isLoading ? (
            <p>Loading services...</p>
          ) : serviceSummary.length > 0 ? (
            <div className="role-cards">
              {serviceSummary.map((s) => (
                <div
                  key={s.service_id}
                  className="role-card"
                  onClick={() => openRatingsModal(s)}
                >
                  <h3>{s.name}</h3>
                  <p>
                    ⭐ {s.avg} ({s.count})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No services found.</p>
          )}
        </>
      )}

      {/* STEP RATINGS MODAL */}
      <StepRatingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={selectedService?.name}
        serviceId={selectedService?.service_id}
        stepRatings={stepRatings}
        serviceInfo={selectedService}
      />
    </div>
  );
}

export default RoleSelectionPage;
