// src/pages/RoleSelectionPage.jsx - UPDATED WITH POSITION AND PRIVACY
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
  const [recentComments, setRecentComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // ⭐ MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stepRatings, setStepRatings] = useState([]);

  // ⭐ REFS
  const scrollContainerRef = useRef(null);
  const ratingsContainerRef = useRef(null);
  const commentsContainerRef = useRef(null);

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

  // ⭐ FETCH SERVICES + FEEDBACK + RECENT COMMENTS
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingComments(true);
    try {
      const [s, f, rc] = await Promise.all([
        axios.get(`${backendURL}/api/services`),
        axios.get(`${backendURL}/api/feedback`),
        axios.get(`${backendURL}/api/feedback/recent-comments`)
      ]);

      setServices(s.data);
      setFeedback(f.data);
      setRecentComments(rc.data);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setServices([]);
      setRecentComments([]);
    } finally {
      setIsLoading(false);
      setIsLoadingComments(false);
    }
  }, [backendURL]);

  useEffect(() => {
    fetchData();
    const pollingInterval = setInterval(() => fetchData(), 15000);
    return () => clearInterval(pollingInterval);
  }, [fetchData]);

  // ⭐ AUTO-SCROLL TO RATINGS WHEN SHOWN
  useEffect(() => {
    if (showRatings && ratingsContainerRef.current) {
      setTimeout(() => {
        ratingsContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
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
    
    if (!willShowRatings && ratingsContainerRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ⭐ FORMAT DATE FOR COMMENTS
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffDays < 365 ? undefined : 'numeric'
      });
    }
  };

  // ⭐ PROTECT EMAIL PRIVACY (show only first 2 letters, rest as asterisks)
  const protectEmail = (email) => {
    if (!email) return 'Anonymous';
    
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username}***@${domain}`;
    }
    
    // Show first 2 characters, then asterisks
    const protectedUsername = username.substring(0, 2) + '*'.repeat(3);
    return `${protectedUsername}@${domain}`;
  };

  // ⭐ GET USER DISPLAY NAME (with privacy protection)
  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      // For users with names, show first name + last initial
      return `${user.first_name} ${user.last_name.charAt(0)}.`;
    } else if (user.user_email) {
      // For email-only users, show protected email
      return protectEmail(user.user_email);
    }
    return 'Anonymous User';
  };

  return (
    <div className="role-container">
      {/* ⭐ NAVBAR */}
      <nav className={`role-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="role-navbar-left">
          <h2 className="role-navbar-logo">ASP DigiGuide</h2>
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
            {showRatings ? 'Hide Ratings' : 'View Ratings'}
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
                          <span className="rating-count">({s.count} ratings)</span>
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

      <h1>Welcome to ASP Digital Guidance System</h1>
      <p className="welcome-subtitle">Sign In Above to Continue</p>

      {/* ⭐ RECENT COMMENTS SECTION - MOVED BELOW WELCOME MESSAGE */}
      <div ref={commentsContainerRef} className="recent-comments-container">
        <h2 className="recent-comments-title">
          <i className="fas fa-comment-dots"></i>
          Recent User Feedback
        </h2>
        <p className="recent-comments-subtitle">
          See what others are saying about our services
        </p>
        
        {isLoadingComments ? (
          <div className="comments-loading">
            <div className="loading-spinner small"></div>
            <p>Loading recent feedback...</p>
          </div>
        ) : recentComments.length > 0 ? (
          <div className="comments-grid">
            {recentComments.map((comment, index) => (
              <div key={comment.feedback_id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="user-details">
                      <span className="user-name">{getUserDisplayName(comment)}</span>
                      <span className="comment-time">{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  <div className="comment-rating">
                    <span className="rating-stars">
                      {"★".repeat(comment.rating)}
                      {"☆".repeat(5 - comment.rating)}
                    </span>
                    <span className="rating-number">({comment.rating}/5)</span>
                  </div>
                </div>
                
                <div className="comment-service">
                  <i className="fas fa-tag"></i>
                  <span className="service-name">{comment.service_name}</span>
                </div>
                
                <div className="comment-text">
                  "{comment.comment.length > 150 
                    ? comment.comment.substring(0, 150) + '...' 
                    : comment.comment}"
                </div>
                
                {/* Privacy notice */}
                <div className="privacy-notice">
                  <i className="fas fa-user-shield"></i>
                  <span>User identity protected for privacy</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-comments">
            <i className="fas fa-comment-slash"></i>
            <h3>No feedback yet</h3>
            <p>Be the first to share your experience! Sign in and rate our services.</p>
          </div>
        )}
      </div>

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
