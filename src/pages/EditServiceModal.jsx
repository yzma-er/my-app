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
  const [preview, setPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const backendURL = "http://localhost:5000";

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

          // ✅ Normalize all steps (add formFile key if missing)
          parsedSteps = parsedSteps.map((step, i) => ({
            title: step.title || `Step ${i + 1}`,
            content: step.content || "",
            formFile: step.formFile || "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setVideoFile(file);
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
        { title: `Step ${form.content.length + 1}`, content: "", formFile: "" },
      ],
    });
  };

  const removeStep = (index) => {
    const updated = form.content.filter((_, i) => i !== index);
    setForm({ ...form, content: updated });
  };

  // ✅ Save all changes
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("description2", form.description2);
      formData.append("content", JSON.stringify(form.content));

      if (videoFile) {
        formData.append("video", videoFile);
      }

      await axios.put(`${backendURL}/api/services/${serviceId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Service updated successfully!");
      onSave();
    } catch (err) {
      console.error("❌ Error updating service:", err);
      alert("Failed to update service.");
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
            <video
              controls
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <source
                src={
                  preview
                    ? preview
                    : service.video
                    ? `${backendURL}/videos/${service.video}`
                    : ""
                }
                type="video/mp4"
              />
            </video>

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
              <div key={index} style={{ marginBottom: "10px" }}>
                <h4 style={{ color: "#1C7C0F" }}>{step.title}</h4>
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

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description (above video)</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description (below video)</label>
            <textarea
              name="description2"
              rows="3"
              value={form.description2}
              onChange={handleChange}
              placeholder="Enter extra details that appear below the video..."
            />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Replace Video</label>
            <input type="file" accept="video/*" onChange={handleFileChange} />

            <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Steps</label>
            {form.content.map((step, index) => (
              <div
                key={index}
                style={{
                  background: "#f4fff4",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #bde3b2",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ color: "#1C7C0F" }}>{step.title}</h4>
                <textarea
                  rows="6"
                  value={step.content}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Enter content for ${step.title}`}
                  style={{ width: "100%", resize: "vertical" }}
                />

                <div style={{ marginTop: "8px" }}>
                  <label>📎 Upload Form (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFormUpload(index, e)}
                  />
                  {step.formFile && (
                    <p style={{ marginTop: "4px" }}>
                      ✅ Uploaded:{" "}
                      <a
                        href={`${backendURL}/forms/${step.formFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1C7C0F", textDecoration: "underline" }}
                      >
                        View Form
                      </a>
                    </p>
                  )}
                </div>

                <button
                  style={{
                    background: "#b71c1c",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "5px 12px",
                    marginTop: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => removeStep(index)}
                >
                  🗑️ Remove
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
