import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ManageCarousel.css";

function ManageCarousel() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "http://192.168.1.6:5000";

  const fetchImages = useCallback(async () => {
  const res = await axios.get(`${backendURL}/api/carousel`);
  setImages(res.data);
}, [backendURL]);

useEffect(() => {
  fetchImages();
}, [fetchImages]);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("caption", caption);

    await axios.post(`${backendURL}/api/carousel/upload`, formData);
    alert("✅ Image uploaded!");
    setFile(null);
    setTitle("");
    setCaption("");
    fetchImages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    await axios.delete(`${backendURL}/api/carousel/${id}`);
    fetchImages();
  };

  return (
    <div className="manage-carousel">
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
            <img src={`${backendURL}/carousel_images/${img.image}`} alt={img.title} />
            <p><strong>{img.title}</strong></p>
            <p>{img.caption}</p>
            <button onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageCarousel;
