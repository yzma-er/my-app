//EditServiceModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Services.css";

function EditServiceModal({ serviceId, onClose, onSave }) {
  const [service, setService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    description2: "",
    content: [],
  });
  const backendURL = "https://digital-guidance-api.onrender.com";

  // ✅ Fetch service details
  useEffect(() => {
    if (serviceId) {
      axios
        .get(`${backendURL}/api/services/${serviceId}`)
        .then((res) => {
          const data = res.data;
          let parsedSteps = [];
          try {
            parsedSteps = JSON.parse(data.content);
            if (!Array.isArray(parsedSteps)) throw new Error();
          } catch {
            parsedSteps = [{ title: "Step 1", content: data.content || "" }];
          }

          // ✅ Normalize all steps (add formFile and videoFile keys if missing)
          parsedSteps = parsedSteps.map((step, i) => ({
            title: step.title || `Step ${i + 1}`,
            content: step.content || "",
            formFile: step.formFile || "",
            videoFile: step.videoFile || "",
          }));

          setService(data);
          setForm({
            name: data.name || "",
            description: data.description || "",
            description2: data.description2 || "",
            content: parsedSteps,
          });
        })
        .catch((err) => console.error("❌ Error fetching service:", err));
    }
  }, [serviceId]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStepChange = (index, value) => {
    const updated = [...form.content];
    updated[index].content = value;
    setForm({ ...form, content: updated });
  };

  const handleStepVideoUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await axios.post(`${backendURL}/api/services/upload/step-video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = [...form.content];
      updated[index].videoFile = res.data.url; // Store Cloudinary URL
      setForm({ ...form, content: updated });

      alert("✅ Step video uploaded successfully!");
    } catch (err) {
      console.error("❌ Step video upload error:", err);
      alert("Failed to upload step video.");
    }
  };

  const handleFormUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("formFile", file);

    try {
      const res = await axios.post(`${backendURL}/api/services/upload/form`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = [...form.content];
      updated[index].formFile = res.data.filename;
      setForm({ ...form, content: updated });

      alert("✅ Form uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload form.");
    }
  };

  const addStep = () => {
    setForm({
      ...form,
      content: [
        ...form.content,
        { 
          title: `Step ${form.content.length + 1}`, 
          content: "", 
          formFile: "",
          videoFile: ""
        },
      ],
    });
  };

  const removeStep = (index) => {
    const updated = form.content.filter((_, i) => i !== index);
    setForm({ ...form, content: updated });
  };

  // ✅ FIXED: Save all changes - Send as JSON, not FormData
  const handleSave = async () => {
    try {
      // Send as JSON data instead of FormData
      const updateData = {
        name: form.name,
        description: form.description,
        description2: form.description2,
        content: JSON.stringify(form.content)
      };

      await axios.put(`${backendURL}/api/services/${serviceId}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Service updated successfully!");
      onSave();
    } catch (err) {
      console.error("❌ Error updating service:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to update service. Check console for details.");
    }
  };

  if (!service) return <div>Loading...</div>;

  return (
    <div className="modal-overlay">
      <div
        className="modal modal-large"
        style={{
          width: "95%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px",
        }}
      >
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>
          Edit Service: <span>{form.name}</span>
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          {/* ✅ LEFT: Live Preview */}
          <div
            style={{
              flex: "1.2",
              background: "#f8fff8",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0 0 10px rgba(0,0,0,0.08)",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#1C7C0F" }}>{form.name}</h2>
            <p>{form.description}</p>

            {form.description2 && (
              <p
                style={{
                  marginTop: "10px",
                  fontStyle: "italic",
                  color: "#333",
                  whiteSpace: "pre-line",
                }}
              >
                {form.description2}
              </p>
            )}

            {form.content.map((step, index) => (
              <div key={index} style={{ 
                marginBottom: "20px", 
                padding: "15px",
                background: "#f0f8f0",
                borderRadius: "8px"
              }}>
                <h4 style={{ color: "#1C7C0F" }}>{step.title}</h4>
                
                {/* Step Video Preview */}
                {step.videoFile && (
                  <div style={{ margin: "10px 0" }}>
                    <video
                      controls
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        maxHeight: "300px"
                      }}
                    >
                      <source src={step.videoFile} type="video/mp4" />
                    </video>
                  </div>
                )}

                <p
                  style={{ whiteSpace: "pre-line" }}
                  dangerouslySetInnerHTML={{
                    __html: step.content.replace(/\n/g, "<br />"),
                  }}
                />
                {step.formFile && (
                  <p>
                    📄{" "}
                    <a
                      href={`${backendURL}/forms/${step.formFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1C7C0F", textDecoration: "underline" }}
                    >
                      Download Form
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ✅ RIGHT: Edit Form */}
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minWidth: "320px",
            }}
          >
            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Service Name</label>
            <input name="name" value={form.name} onChange={handleChange} />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description (above steps)</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description (below steps)</label>
            <textarea
              name="description2"
              rows="3"
              value={form.description2}
              onChange={handleChange}
              placeholder="Enter extra details that appear below the steps..."
            />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Steps</label>
            {form.content.map((step, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f4fff4",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #bde3b2",
                    marginBottom: "15px",
                  }}
                >
                  {/* Step Title */}
                  <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                    Step Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...form.content];
                      updated[index].title = e.target.value;
                      setForm({ ...form, content: updated });
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "6px",
                      border: "1px solid #bde3b2"
                    }}
                  />
              
                  {/* Step Video Upload */}
                  <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                    🎥 Step Video (optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleStepVideoUpload(index, e)}
                    style={{ marginBottom: "10px" }}
                  />
                  {step.videoFile && (
                    <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                      ✅ Current: {step.videoFile}
                    </p>
                  )}
              
                  {/* Step Content */}
                  <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                    Step Content
                  </label>
                  <textarea
                    rows="6"
                    value={step.content}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Enter content for ${step.title}`}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #bde3b2",
                      marginBottom: "10px"
                    }}
                  />
              
                  {/* Upload Form */}
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                      📎 Upload Form (optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFormUpload(index, e)}
                    />
                    {step.formFile && (
                      <p style={{ marginTop: "4px", fontSize: "14px" }}>
                        ✅ Uploaded: {step.formFile}
                      </p>
                    )}
                  </div>
              
                  {/* Remove Step Button */}
                  <button
                    style={{
                      background: "#b71c1c",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() => removeStep(index)}
                  >
                    🗑️ Remove Step
                  </button>
                </div>
              ))}

            <button
              style={{
                background: "#1C7C0F",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "8px 16px",
                cursor: "pointer",
                width: "fit-content",
              }}
              onClick={addStep}
            >
              + Add Step
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                style={{
                  background: "#1C7C0F",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  padding: "10px 22px",
                  cursor: "pointer",
                }}
                onClick={handleSave}
              >
                💾 Save Changes
              </button>

              <button
                style={{
                  background: "#b71c1c",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  padding: "10px 22px",
                  cursor: "pointer",
                }}
                onClick={onClose}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditServiceModal;
