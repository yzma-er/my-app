import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageCarousel.css";

function ManageCarousel() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // Fetch all carousel images (Cloudinary URLs)
  const fetchImages = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/carousel`);
      console.log("Fetched images:", res.data); // Debug log
      setImages(res.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, [backendURL]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Upload image to backend → backend uploads to Cloudinary
  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("caption", caption);

    try {
      await axios.post(`${backendURL}/api/carousel/upload`, formData);
      alert("✅ Image uploaded!");

      setFile(null);
      setTitle("");
      setCaption("");

      fetchImages();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("❌ Upload failed. Check console.");
    }
  };

  // Delete image (backend also removes from Cloudinary)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${backendURL}/api/carousel/${id}`);
      fetchImages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="manage-carousel">
      
      {/* Back button */}
      <div style={{ position: "relative", marginBottom: "20px", height: "40px" }}>
        <button
          className="back-admin-btn"
          onClick={() => navigate("/admin")}
          style={{
            padding: "6px 12px",
            borderRadius: "30px",
            backgroundColor: "#1c7c0f",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            position: "absolute",
            left: 0,
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>←</span>
        </button>
      </div>

      <h2>Manage Carousel Images</h2>

      <div className="upload-form">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button onClick={handleUpload}>Upload</button>
      </div>

      <div className="carousel-grid">
        {images.map((img) => (
          <div key={img.id} className="carousel-card">
            {/* Debug info - remove after testing */}
            <div style={{ fontSize: '10px', color: 'red', marginBottom: '5px' }}>
              URL: {img.imageUrl ? 'Present' : 'Missing'}
            </div>
            
            {/* Cloudinary URL */}
            <img 
              src={img.imageUrl} 
              alt={img.title || 'Carousel image'} 
              onError={(e) => {
                console.error('Image failed to load:', img.imageUrl);
                e.target.style.border = '2px solid red';
              }}
              onLoad={(e) => {
                console.log('Image loaded successfully:', img.imageUrl);
                e.target.style.border = '2px solid green';
              }}
            />

            <p><strong>{img.title || 'No title'}</strong></p>
            <p>{img.caption || 'No caption'}</p>

            <button onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Debug section - remove after testing */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h4>Debug Info:</h4>
        <p>Total images: {images.length}</p>
        <p>Sample image data:</p>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(images[0] || 'No images', null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default ManageCarousel;
