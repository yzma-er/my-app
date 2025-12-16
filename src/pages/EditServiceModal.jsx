//EditServiceModal.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Services.css";

function EditServiceModal({ serviceId, onClose, onSave }) {
  const [service, setService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    photo: "",
    description2: "",
    content: [],
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const backendURL = "https://digital-guidance-api.onrender.com";

  // Refs for textareas to handle bold formatting
  const descriptionRef = useRef(null);
  const description2Ref = useRef(null);
  const stepContentRefs = useRef([]);

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

          parsedSteps = parsedSteps.map((step, i) => ({
            title: step.title || `Step ${i + 1}`,
            customName: step.customName || "",
            content: step.content || "",
            formFile: step.formFile || "",
            originalFormName: step.originalFormName || "",
            videoFile: step.videoFile || "",
          }));

          setService(data);
          setForm({
            name: data.name || "",
            description: data.description || "",
            photo: data.photo || "",
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

  // ✅ NEW: Format text as bold
  const formatBold = (fieldName, index = null) => {
    const textarea = getTextareaRef(fieldName, index);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      const newText = `**${selectedText}**`;
      const newValue = textarea.value.substring(0, start) + 
                      newText + 
                      textarea.value.substring(end);
      
      if (fieldName === 'description') {
        setForm({ ...form, description: newValue });
      } else if (fieldName === 'description2') {
        setForm({ ...form, description2: newValue });
      } else if (fieldName === 'stepContent') {
        const updated = [...form.content];
        updated[index].content = newValue;
        setForm({ ...form, content: updated });
      }
      
      // Restore cursor position
      setTimeout(() => {
        const newCursorPos = start + newText.length;
        if (fieldName === 'description' && descriptionRef.current) {
          descriptionRef.current.setSelectionRange(newCursorPos, newCursorPos);
          descriptionRef.current.focus();
        } else if (fieldName === 'description2' && description2Ref.current) {
          description2Ref.current.setSelectionRange(newCursorPos, newCursorPos);
          description2Ref.current.focus();
        } else if (fieldName === 'stepContent' && stepContentRefs.current[index]) {
          stepContentRefs.current[index].setSelectionRange(newCursorPos, newCursorPos);
          stepContentRefs.current[index].focus();
        }
      }, 0);
    }
  };

  // ✅ Helper to get textarea ref
  const getTextareaRef = (fieldName, index) => {
    if (fieldName === 'description') return descriptionRef.current;
    if (fieldName === 'description2') return description2Ref.current;
    if (fieldName === 'stepContent') return stepContentRefs.current[index];
    return null;
  };

  // ✅ NEW: Parse bold text for preview (using **text** syntax)
  const parseBoldText = (text) => {
    if (!text) return text;
    
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // ✅ Handle custom name changes
  const handleCustomNameChange = (index, value) => {
    const updated = [...form.content];
    updated[index].customName = value;
    setForm({ ...form, content: updated });
  };

  // ✅ Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Please select an image smaller than 5MB.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please select a JPG, PNG, GIF, or WebP image.");
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${backendURL}/api/services/upload/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ ...form, photo: res.data.url });
      alert("✅ Photo uploaded successfully!");
    } catch (err) {
      console.error("❌ Photo upload error:", err);
      const errorMessage = err.response?.data?.message || "Failed to upload photo";
      alert(`Photo upload failed: ${errorMessage}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ✅ Remove photo
  const handleRemovePhoto = () => {
    if (window.confirm("Are you sure you want to remove this photo?")) {
      setForm({ ...form, photo: "" });
    }
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
      updated[index].videoFile = res.data.url;
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

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Please select a file smaller than 10MB.");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please select a PDF, DOC, or DOCX file.");
      return;
    }

    const formData = new FormData();
    formData.append("formFile", file);

    try {
      const res = await axios.post(`${backendURL}/api/services/upload/form`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload successful:", res.data);

      const updated = [...form.content];
      updated[index].formFile = res.data.url;
      updated[index].originalFormName = res.data.originalName || file.name;
      setForm({ ...form, content: updated });

      alert("✅ Form uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      const errorMessage = err.response?.data?.message || "Failed to upload form";
      alert(`Upload failed: ${errorMessage}`);
    }
  };

  const addStep = () => {
    setForm({
      ...form,
      content: [
        ...form.content,
        { 
          title: `Step ${form.content.length + 1}`, 
          customName: "",
          content: "", 
          formFile: "",
          originalFormName: "",
          videoFile: ""
        },
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
      const updateData = {
        name: form.name,
        description: form.description,
        photo: form.photo,
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
          position: "relative"
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#004d00",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f0f0f0";
            e.target.style.color = "#b71c1c";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "none";
            e.target.style.color = "#004d00";
          }}
        >
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
            {/* ✅ Render description with bold support */}
            <p dangerouslySetInnerHTML={{ __html: parseBoldText(form.description) }} />

            {form.photo && (
              <div style={{ 
                margin: "15px 0", 
                textAlign: "center",
                border: "1px solid #bde3b2",
                borderRadius: "10px",
                padding: "10px",
                background: "#f0f8f0"
              }}>
                <img 
                  src={form.photo} 
                  alt="Service" 
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    objectFit: "contain"
                  }}
                />
                <p style={{ 
                  marginTop: "8px", 
                  fontSize: "14px", 
                  color: "#666",
                  fontStyle: "italic"
                }}>
                  Service Photo
                </p>
              </div>
            )}

            {form.description2 && (
              <p dangerouslySetInnerHTML={{ __html: parseBoldText(form.description2) }} />
            )}

            {form.content.map((step, index) => (
              <div key={index} style={{ 
                marginBottom: "20px", 
                padding: "15px",
                background: "#f0f8f0",
                borderRadius: "8px"
              }}>
                <h4 style={{ color: "#1C7C0F" }}>
                  {step.customName ? `${step.title} - ${step.customName}` : step.title}
                </h4>
                
                {step.videoFile && (
                  <div style={{ margin: "10px 0", width: "100%" }}>
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "10px",
                        maxHeight: "300px",
                        objectFit: "contain"
                      }}
                    >
                      <source src={step.videoFile} type="video/mp4" />
                    </video>
                  </div>
                )}

                {/* ✅ Render step content with bold support */}
                <p dangerouslySetInnerHTML={{ __html: parseBoldText(step.content) }} />
                
                {step.formFile && (
                  <p>
                    📄{" "}
                    <a
                      href={step.formFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1C7C0F", textDecoration: "underline" }}
                      download={step.originalFormName || "form"}
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

            {/* ✅ Description 1 with Bold Button */}
            <div style={{ 
              background: "#f4fff4", 
              padding: "15px", 
              borderRadius: "10px",
              border: "1px solid #bde3b2"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description 1</label>
                <button
                  type="button"
                  onClick={() => formatBold('description')}
                  style={{
                    background: "#1C7C0F",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                  title="Make selected text bold (Ctrl+B)"
                >
                  <strong>B</strong> Bold
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                💡 Select text and click "Bold" or use <strong>**text**</strong> syntax
              </div>
            </div>

            {/* Photo Upload Section (unchanged) */}
            <div style={{ 
              background: "#f4fff4", 
              padding: "15px", 
              borderRadius: "10px",
              border: "1px solid #bde3b2"
            }}>
              <label style={{ fontWeight: "bold", color: "#1C7C0F", marginBottom: "10px", display: "block" }}>
                📷 Service Photo (Between Description 1 and 2)
              </label>
              
              {form.photo ? (
                <div style={{ 
                  marginBottom: "15px",
                  textAlign: "center"
                }}>
                  <img 
                    src={form.photo} 
                    alt="Preview" 
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: "1px solid #ddd"
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                      onClick={() => document.getElementById('photo-upload').click()}
                      style={{
                        background: "#1C7C0F",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      style={{
                        background: "#b71c1c",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  border: "2px dashed #bde3b2",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "center",
                  background: "#f9fff9",
                  marginBottom: "15px"
                }}>
                  <p style={{ color: "#666", marginBottom: "15px" }}>
                    No photo uploaded. Add a photo that will appear between Description 1 and Description 2.
                  </p>
                  <button
                    onClick={() => document.getElementById('photo-upload').click()}
                    disabled={uploadingPhoto}
                    style={{
                      background: uploadingPhoto ? "#ccc" : "#1C7C0F",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      cursor: uploadingPhoto ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    {uploadingPhoto ? (
                      <>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>📷</span>
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
              
              <div style={{ 
                fontSize: "12px", 
                color: "#666", 
                marginTop: "10px",
                padding: "8px",
                background: "#f0f8f0",
                borderRadius: "6px"
              }}>
                <strong>Note:</strong> Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.
              </div>
            </div>

            {/* ✅ Description 2 with Bold Button */}
            <div style={{ 
              background: "#f4fff4", 
              padding: "15px", 
              borderRadius: "10px",
              border: "1px solid #bde3b2"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>Description 2</label>
                <button
                  type="button"
                  onClick={() => formatBold('description2')}
                  style={{
                    background: "#1C7C0F",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                  title="Make selected text bold (Ctrl+B)"
                >
                  <strong>B</strong> Bold
                </button>
              </div>
              <textarea
                ref={description2Ref}
                name="description2"
                rows="3"
                value={form.description2}
                onChange={handleChange}
                placeholder="Enter extra details that appear below the photo..."
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                💡 Select text and click "Bold" or use <strong>**text**</strong> syntax
              </div>
            </div>

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
                <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                  Step {index + 1}
                </label>
                <br></br>
                <label style={{ fontWeight: "bold", color: "#1C7C0F", marginTop: "8px" }}>
                  Step Custom Name (e.g., "Sample Office")
                </label>
                <input
                  type="text"
                  placeholder="Enter custom step name..."
                  value={step.customName}
                  onChange={(e) => handleCustomNameChange(index, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    border: "1px solid #bde3b2"
                  }}
                />
            
                <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                  🎥 Step Video
                </label>
                <br></br>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleStepVideoUpload(index, e)}
                  style={{ marginBottom: "10px" }}
                />
               
              {step.videoFile && (
                <p style={{ 
                  marginBottom: "10px", 
                  fontSize: "14px",
                  background: "#e8f5e8",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  color: "#1C7C0F",
                  fontWeight: "bold"
                }}>
                  ✅ Step video uploaded successfully!
                </p>
              )}
            
                {/* ✅ Step Content with Bold Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                    Step Content
                  </label>
                  <button
                    type="button"
                    onClick={() => formatBold('stepContent', index)}
                    style={{
                      background: "#1C7C0F",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                    title="Make selected text bold"
                  >
                    <strong>B</strong> Bold
                  </button>
                </div>
                
                <textarea
                  ref={el => stepContentRefs.current[index] = el}
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
                <div style={{ fontSize: "12px", color: "#666", marginTop: "-5px", marginBottom: "10px" }}>
                  💡 Select text and click "Bold" or use <strong>**text**</strong> syntax
                </div>
            
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontWeight: "bold", color: "#1C7C0F" }}>
                    📎 Upload Form 
                  </label>
                  <br></br>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFormUpload(index, e)}
                  />
                  {step.formFile && (
                    <p style={{ marginTop: "4px", fontSize: "14px" }}>
                      ✅ Uploaded: {step.originalFormName || step.formFile}
                    </p>
                  )}
                </div>
            
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
