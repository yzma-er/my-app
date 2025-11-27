import React, { useState } from "react";
import axios from "axios";
import "./Modal.css";

function EditServiceModal({ service, onClose, refreshServices }) {
  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [description2, setDescription2] = useState(service?.description2 || "");
  const [steps, setSteps] = useState(() => {
    try {
      return JSON.parse(service?.content || "[]");
    } catch {
      return [];
    }
  });

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: "", content: "", formFile: "", videoFile: "" }]);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // send all step form + video files using formData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("description2", description2);
    formData.append("steps", JSON.stringify(steps));

    // Attach all step files to request
    steps.forEach((step, index) => {
      if (step.formFile instanceof File) {
        formData.append(`form_${index}`, step.formFile);
      }
      if (step.videoFile instanceof File) {
        formData.append(`video_${index}`, step.videoFile);
      }
    });

    try {
      await axios.put(`${backendURL}/api/services/${service.service_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Service Updated Successfully!");
      refreshServices();
      onClose();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Update failed.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Service</h2>

        <form onSubmit={handleSubmit}>
          <label>Service Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

          <label>Description 2</label>
          <textarea value={description2} onChange={(e) => setDescription2(e.target.value)} />

          <h3>Steps</h3>
          {steps.map((step, index) => (
            <div key={index} className="step-box">
              <label>Step Title</label>
              <input
                value={step.title}
                onChange={(e) => handleStepChange(index, "title", e.target.value)}
                required
              />

              <label>Step Content</label>
              <textarea
                value={step.content}
                onChange={(e) => handleStepChange(index, "content", e.target.value)}
              />

              {/* 📄 FORM FILE */}
              <label>Upload Form (optional)</label>
              <input
                type="file"
                onChange={(e) =>
                  handleStepChange(index, "formFile", e.target.files[0])
                }
              />

              {/* 🎥 NEW — STEP VIDEO */}
              <label>Upload Video for This Step</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  handleStepChange(index, "videoFile", e.target.files[0])
                }
              />

              <button type="button" className="remove-btn" onClick={() => removeStep(index)}>
                ❌ Remove Step
              </button>
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addStep}>
            ➕ Add Step
          </button>

          <div className="modal-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditServiceModal;
