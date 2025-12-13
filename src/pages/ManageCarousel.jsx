import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageCarousel.css";

function ManageCarousel() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const navigate = useNavigate();

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // Fetch all carousel images (Cloudinary URLs)
  const fetchImages = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/carousel`);
      console.log("Fetched images:", res.data);
      // Sort by display_order if available, otherwise keep current order
      const sortedImages = res.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setImages(sortedImages);
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

    setUploading(true);

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
    } finally {
      setUploading(false);
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

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex) return;

    setReordering(true);

    // Create new reordered array
    const newImages = [...images];
    const [movedItem] = newImages.splice(draggedItem, 1);
    newImages.splice(targetIndex, 0, movedItem);

    // Update local state immediately for responsive UI
    setImages(newImages);
    setDraggedItem(null);

    // Update display_order in database
    try {
      const updateData = newImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));

      console.log('Sending reorder data:', updateData);
      
      const response = await axios.put(`${backendURL}/api/carousel/reorder`, { images: updateData });
      console.log('Reorder response:', response.data);
      
      alert("✅ Image order updated successfully!");
    } catch (error) {
      console.error("Failed to update order:", error);
      console.error("Error response:", error.response?.data);
      alert(`❌ Failed to save new order: ${error.response?.data?.message || error.message}`);
      // Revert to original order if update fails
      fetchImages();
    } finally {
      setReordering(false);
    }
  };

  // Move image up in order
  const moveUp = async (index) => {
    if (index === 0) return;

    setReordering(true);

    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    
    setImages(newImages);

    try {
      const updateData = newImages.map((img, idx) => ({
        id: img.id,
        display_order: idx
      }));

      console.log('Moving up - sending data:', updateData);
      await axios.put(`${backendURL}/api/carousel/reorder`, { images: updateData });
    } catch (error) {
      console.error("Failed to update order:", error);
      console.error("Error response:", error.response?.data);
      alert(`❌ Failed to update order: ${error.response?.data?.message || error.message}`);
      fetchImages();
    } finally {
      setReordering(false);
    }
  };

  // Move image down in order
  const moveDown = async (index) => {
    if (index === images.length - 1) return;

    setReordering(true);

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    
    setImages(newImages);

    try {
      const updateData = newImages.map((img, idx) => ({
        id: img.id,
        display_order: idx
      }));

      console.log('Moving down - sending data:', updateData);
      await axios.put(`${backendURL}/api/carousel/reorder`, { images: updateData });
    } catch (error) {
      console.error("Failed to update order:", error);
      console.error("Error response:", error.response?.data);
      alert(`❌ Failed to update order: ${error.response?.data?.message || error.message}`);
      fetchImages();
    } finally {
      setReordering(false);
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

      {/* Upload Form */}
      <div className="upload-form">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          disabled={uploading}
        />

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
        />

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
        />

        <button 
          onClick={handleUpload} 
          disabled={uploading || !file}
          className={uploading ? "uploading" : ""}
        >
          {uploading ? (
            <>
              <div className="loader-small"></div>
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>
      </div>

      {/* Global Reordering Loader */}
      {reordering && (
        <div className="global-loader">
          <div className="loader"></div>
          <p>Updating image order...</p>
        </div>
      )}

      <div className="reorder-instructions">
        <p>🎯 <strong>How to reorder:</strong> Drag and drop images to change their display order, or use the up/down buttons.</p>
        <p>Images are displayed from left to right, top to bottom.</p>
      </div>

      <div className={`carousel-grid ${reordering ? "reordering" : ""}`}>
        {images.map((img, index) => (
          <div 
            key={img.id} 
            className={`carousel-card ${draggedItem === index ? 'dragging' : ''}`}
            draggable={!reordering}
            onDragStart={(e) => !reordering && handleDragStart(e, index)}
            onDragOver={(e) => !reordering && handleDragOver(e, index)}
            onDrop={(e) => !reordering && handleDrop(e, index)}
          >
            <div className="card-header">
              <span className="position-badge">#{index + 1}</span>
              <div className="move-buttons">
                <button 
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || reordering}
                  title="Move up"
                >
                  ↑
                </button>
                <button 
                  onClick={() => moveDown(index)}
                  disabled={index === images.length - 1 || reordering}
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>

            <img src={img.image} alt={img.title || 'Carousel image'} />

            <p><strong>{img.title || 'No title'}</strong></p>
            <p>{img.caption || 'No caption'}</p>

            <button 
              onClick={() => handleDelete(img.id)}
              className="delete-btn"
              disabled={reordering}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageCarousel;
