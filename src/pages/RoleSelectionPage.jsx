// src/pages/RoleSelectionPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoleSelectionPage.css';
import StepRatingsModal from "../components/StepRatingsModal";

function RoleSelectionPage() {
  const navigate = useNavigate();
  const images = ['/carousel1.jpg', '/carousel2.jpg', '/carousel3.jpg', '/carousel4.jpg'];

  const [current, setCurrent] = useState(0);
  const [showRatings, setShowRatings] = useState(false);
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // ⭐ MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stepRatings, setStepRatings] = useState([]);

  // ⭐ REFS
  const scrollContainerRef = useRef(null);
  const ratingsContainerRef = useRef(null);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // 🧩 Detect scroll position for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭐ FETCH SERVICES + FEEDBACK
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
    const pollingInterval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(pollingInterval);
  }, [fetchData]);

  // ⭐ AUTO-SCROLL TO RATINGS WHEN SHOWN
  useEffect(() => {
    if (showRatings && ratingsContainerRef.current) {
      // Wait a moment for the ratings to render
      setTimeout(() => {
        ratingsContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start', // Align to top of viewport
          inline: 'nearest'
        });
      }, 100);
    }
  }, [showRatings]);

  // ⭐ CAROUSEL AUTO-SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // ⭐ GO TO SPECIFIC SLIDE
  const goToSlide = (index) => {
    setCurrent(index);
  };

  // ⭐ COMPUTE AVERAGE RATINGS
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

  // ⭐ OPEN MODAL + LOAD STEP RATINGS
  const openRatingsModal = async (service) => {
    try {
      const res = await axios.get(`${backendURL}/api/feedback/step-ratings/${encodeURIComponent(service.name)}`);
      setStepRatings(res.data);
    } catch (err) {
      console.error("❌ Failed to load step ratings:", err);
    }

    setSelectedService(service);
    setModalOpen(true);
  };

  // ⭐ HORIZONTAL SCROLL FUNCTIONS
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // ⭐ TOGGLE RATINGS WITH SCROLL
  const toggleRatingsWithScroll = () => {
    const willShowRatings = !showRatings;
    setShowRatings(willShowRatings);
    
    // If we're showing ratings, the useEffect will handle scrolling
    // If we're hiding ratings, scroll back to top
    if (!willShowRatings && ratingsContainerRef.current) {
      // Scroll to top of page when hiding ratings
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="role-container">
      {/* ⭐ NAVBAR */}
      <nav className={`role-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="role-navbar-left">
          <h2 className="role-navbar-logo">ASP Digital Guidance</h2>
        </div>
        
        <div className="role-navbar-buttons">
          <button 
            className="role-navbar-btn admin-btn"
            onClick={() => navigate('/login?role=admin')}
          >
            <i className="fas fa-user-shield"></i>
            Administrator
          </button>
          
          <button 
            className="role-navbar-btn user-btn"
            onClick={() => navigate('/login?role=user')}
          >
            <i className="fas fa-user"></i>
            User
          </button>
          
          <button 
            className="role-navbar-btn ratings-btn"
            onClick={toggleRatingsWithScroll}
          >
            <i className="fas fa-star"></i>
            {showRatings ? 'Hide Service Ratings' : 'View Service Ratings'}
          </button>
        </div>
      </nav>

      {/* ⭐ SERVICE RATINGS - ABOVE CAROUSEL */}
      <div ref={ratingsContainerRef}>
        {showRatings && (
          <div className="ratings-container">
            <h2 className="ratings-title">
              <i className="fas fa-chart-bar"></i>
              Service Ratings
            </h2>
            
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading service ratings...</p>
              </div>
            ) : serviceSummary.length > 0 ? (
              <div className="horizontal-scroll-container">
                <button className="scroll-btn left" onClick={scrollLeft}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <div 
                  className="horizontal-scroll-wrapper"
                  ref={scrollContainerRef}
                >
                  {serviceSummary.map((s) => (
                    <div
                      key={s.service_id}
                      className="role-card"
                      onClick={() => openRatingsModal(s)}
                    >
                      <div className="role-card-header">
                        <h3>{s.name}</h3>
                        <div className="role-card-rating">
                          <i className="fas fa-star"></i>
                          <span className="rating-value">{s.avg}</span>
                          <span className="rating-count">({s.count})</span>
                        </div>
                      </div>
                      <div className="role-card-actions">
                        <button className="view-details-btn">
                          View Details <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="scroll-btn right" onClick={scrollRight}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            ) : (
              <div className="no-services">
                <i className="fas fa-info-circle"></i>
                <p>No services found or unable to load ratings.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ⭐ CAROUSEL WITH DOTS */}
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, index) => (
            <img key={index} src={img} alt={`Slide ${index + 1}`} className="carousel-image" />
          ))}
        </div>
        
        {/* CAROUSEL DOTS */}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${current === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ⭐ LOGO AND HEADINGS */}
      <img src="/nvsu-logo.gif" alt="NVSU Logo" className="logo" />
      <h2>Auxiliary Services Program</h2>
      <h3>Nueva Vizcaya State University</h3>
      <p>Bayombong, Nueva Vizcaya</p>

      <h1>Welcome to Digital Guidance System</h1>
      <p className="welcome-subtitle">Select your role to continue</p>

      {/* ⭐ STEP RATINGS MODAL */}
      <StepRatingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={selectedService?.name}
        stepRatings={stepRatings}
      />

      {/* ⭐ FOOTER */}
      <footer className="role-footer">
        <p>© {new Date().getFullYear()} NVSU Auxiliary Services Program. All rights reserved.</p>
        <p>Bayombong, Nueva Vizcaya, Philippines</p>
      </footer>
    </div>
  );
}

export default RoleSelectionPage;
