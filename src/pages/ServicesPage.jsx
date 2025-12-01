// ServicesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ServicesPage.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import axios from "axios";

function ServicesPage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auto-detect backend (Localhost vs Web)
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // ✅ Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/services`);
        setServices(res.data);
      } catch (err) {
        console.error("❌ Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [backendURL]);

  // ✅ Fetch Carousel Images (Cloudinary URLs already stored in DB)
  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/carousel`);
        setCarouselImages(res.data);
      } catch (err) {
        console.error("❌ Error fetching carousel:", err);
      }
    };
    fetchCarousel();
  }, []);

  // ✅ Auto-slide every 4 seconds
  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages]);

  // ✅ Go to specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // ✅ Next slide
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  // ✅ Previous slide
  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  // Filter services by search
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="services-container">
      <NavBar />

      {/* ✅ CAROUSEL */}
      <div className="carousel-container">
        {carouselImages.length > 0 ? (
          <div className="custom-carousel">
            {/* Carousel Track */}
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {carouselImages.map((img, index) => (
                <div key={index} className="carousel-slide">
                  <img
                    src={img.image}
                    alt={img.title || "Carousel Image"}
                    className="carousel-image"
                  />
                  <div className="carousel-caption">
                    {img.title && <h3>{img.title}</h3>}
                    {img.caption && <p>{img.caption}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              className="carousel-btn prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ❮
            </button>

            <button
              className="carousel-btn next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ❯
            </button>

            {/* Carousel Dots */}
            <div className="carousel-dots">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="loading-carousel">🕓 Loading carousel...</p>
        )}
      </div>

      {/* ✅ PAGE TITLE & SEARCH */}
      <div className="services-header">
        <div className="services-title-container">
          <h1 className="services-title">Services</h1>
        </div>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      {/* ✅ SERVICES LIST */}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading services...</p>
        </div>
      ) : (
        <div className="services-list">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div
                key={service.service_id}
                className="service-card"
                onClick={() => navigate(`/services/${service.service_id}`)}
              >
                <h3>{service.name}</h3>
                <p>{service.description || "Click to view details"}</p>
              </div>
            ))
          ) : (
            <p>No services found</p>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ServicesPage;
