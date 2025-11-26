// src/pages/RoleSelectionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StepRatingsModal from "../components/StepRatingsModal";  // <-- ADD THIS
import './RoleSelectionPage.css';

function RoleSelectionPage() {
  const navigate = useNavigate();
  const images = ['/carousel1.jpg', '/carousel2.jpg', '/carousel3.jpg'];

  const [current, setCurrent] = useState(0);
  const [showRatings, setShowRatings] = useState(false);
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [stepRatings, setStepRatings] = useState([]);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // Fetch services & feedback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, f] = await Promise.all([
        axios.get(`${backendURL}/api/services`),
        axios.get(`${backendURL}/api/feedback`)
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
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // CALCULATE SERVICE AVG SUMMARY
  const serviceSummary = services.map((s) => {
    const serviceFeedback = feedback.filter(
      f => f.service_name?.trim().toLowerCase() === s.name.trim().toLowerCase()
    );

    const avg =
      serviceFeedback.length > 0
        ? (serviceFeedback.reduce((sum, f) => sum + f.rating, 0) / serviceFeedback.length).toFixed(1)
        : "N/A";

    return { ...s, avg, count: serviceFeedback.length };
  });

  // 🔥 FETCH STEP RATINGS WHEN OPENED
  const openStepModal = async (serviceName) => {
    setSelectedServiceName(serviceName);

    try {
      const res = await axios.get(`${backendURL}/api/feedback/steps/${serviceName}`);
      setStepRatings(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error("❌ Failed loading step ratings", err);
    }
  };

  return (
    <div className="role-container">

      {/* CAROUSEL */}
      <div className="carousel-container">
        <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((img, index) => (
            <img key={index} src={img} alt={`Slide ${index + 1}`} className="carousel-image" />
          ))}
        </div>
      </div>

      {/* LOGO + HEADER */}
      <img src="/nvsu-logo.gif" alt="NVSU Logo" className="logo" />
      <h2>Nueva Vizcaya State University</h2>
      <h3>Auxiliary Services Program</h3>
      <p>Bayombong, Nueva Vizcaya</p>

      {/* ROLE BUTTONS */}
      <div className="button-group">
        <button onClick={() => navigate('/login?role=admin')}>Administrator</button>
        <button onClick={() => navigate('/login?role=user')}>User</button>
      </div>

      {/* SHOW/HIDE RATING SUMMARY */}
      <button className="ratings-toggle-btn" onClick={() => setShowRatings(prev => !prev)}>
        {showRatings ? 'Hide Service Ratings' : 'View Service Ratings'}
      </button>

      {/* SERVICE LIST WITH CLICKABLE SUMMARY */}
      {showRatings && (
        <>
          {isLoading ? (
            <p>Loading services...</p>
          ) : serviceSummary.length > 0 ? (
            <div className="role-cards">
              
              {serviceSummary.map((s) => (
                <div key={s.service_id} className="role-card">

                  <h3 onClick={() => navigate(`/service/${s.service_id}`)}>
                    {s.name}
                  </h3>

                  {/* 🔻 CLICK → OPEN MODAL STEP RATINGS 🔻 */}
                  <p 
                    className="rating-summary"
                    onClick={() => openStepModal(s.name)}
                    style={{ cursor:"pointer", textDecoration:"underline" }}
                  >
                    ⭐ {s.avg} ({s.count}) — View Step Ratings
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <p>No services found or unable to load ratings.</p>
          )}
        </>
      )}

      {/* 🔥 MODAL POPS HERE */}
      <StepRatingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={selectedServiceName}
        stepRatings={stepRatings}
      />

    </div>
  );
}

export default RoleSelectionPage;
