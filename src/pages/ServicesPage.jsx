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

  // -------------------------------
  // ✅ Fetch Services
  // -------------------------------
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

  // -------------------------------
  // ✅ Fetch Carousel Images (Cloudinary URLs already stored in DB)
  // -------------------------------
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

  // -------------------------------
  // ✅ Auto-slide every 4 seconds
  // -------------------------------
  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages]);

  // -------------------------------
  // Filter services by search
  // -------------------------------
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="services-container">
      <NavBar />

      {/* ----------------------- */}
      {/* ✅ CAROUSEL */}
      {/* ----------------------- */}
      <div className="carousel-container">
        {carouselImages.length > 0 ? (
          <div className="custom-carousel">
            <div className="carousel-slide fade">
              <img
                src={carouselImages[currentIndex].image} // Cloudinary URL
                alt={carouselImages[currentIndex].title || "Carousel Image"}
                className="carousel-image"
              />
              <div className="carousel-caption">
                {carouselImages[currentIndex].title && (
                  <h3>{carouselImages[currentIndex].title}</h3>
                )}
                {carouselImages[currentIndex].caption && (
                  <p>{carouselImages[currentIndex].caption}</p>
                )}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              className="carousel-btn prev"
              onClick={() =>
                setCurrentIndex(
                  (prevIndex) =>
                    (prevIndex - 1 + carouselImages.length) %
                    carouselImages.length
                )
              }
            >
              ❮
            </button>

            <button
              className="carousel-btn next"
              onClick={() =>
                setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
              }
            >
              ❯
            </button>
          </div>
        ) : (
          <p className="loading-carousel">🕓 Loading carousel...</p>
        )}
      </div>

      {/* ----------------------- */}
      {/* ✅ PAGE TITLE & SEARCH */}
      {/* ----------------------- */}
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

      {/* ----------------------- */}
      {/* ✅ SERVICES LIST */}
      {/* ----------------------- */}
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
