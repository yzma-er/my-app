import React, { useState, useEffect } from "react";
import axios from "axios";

const EditServiceModal = ({ onClose, service, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);

      // load steps with video links if exist
      setSteps(service.steps.map(step => ({
        ...step,
        videoPreview: step.video || null,
        videoFile: null
      })));
    }
  }, [service]);

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const handleVideoUpload = (index, file) => {
    const updatedSteps = [...steps];
    updatedSteps[index].videoFile = file;
    updatedSteps[index].videoPreview = URL.createObjectURL(file); 
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "", videoFile: null, videoPreview: null }]);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      steps.forEach((step, i) => {
        formData.append(`steps[${i}][title]`, step.title);
        formData.append(`steps[${i}][description]`, step.description);
        
        if (step.videoFile) {
          formData.append(`steps[${i}][video]`, step.videoFile);
        } else if (step.videoPreview) {
          formData.append(`steps[${i}][video]`, step.videoPreview);
        }
      });

      const response = await axios.put(
        `http://localhost:8080/api/services/${service.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onSave(response.data);
      onClose();
      
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-box">

        <h2 style={{ fontWeight:"bold", fontSize:"22px", marginBottom:"10px" }}>
          ✏ Edit Service
        </h2>

        <label>Service Title</label>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} />

        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />

        <h3 style={{ marginTop:"15px", fontWeight:"600" }}>Step List</h3>
        
        {steps.map((step, index) => (
          <div key={index} className="step-box">

            <label>Step Title</label>
            <input value={step.title} onChange={(e)=>handleStepChange(index,"title",e.target.value)} />

            <label>Description</label>
            <textarea rows={2} 
              value={step.description}
              onChange={(e)=>handleStepChange(index,"description",e.target.value)}
            />

            <label>Step Video</label>
            <input type="file" accept="video/*" onChange={(e)=>handleVideoUpload(index,e.target.files[0])} />

            {step.videoPreview && (
              <video width="100%" height="200" controls style={{ marginTop:"8px", borderRadius:"8px" }}>
                <source src={step.videoPreview} type="video/mp4"/>
              </video>
            )}

            <button className="remove-step-btn" onClick={()=>removeStep(index)}>
              Remove Step
            </button>
          </div>
        ))}

        <button 
          onClick={addStep}
          style={{ background:"#1C7C0F", color:"#fff", padding:"8px 14px", borderRadius:"8px", marginBottom:"15px", border:"none", cursor:"pointer" }}>
          + Add Step
        </button><br/>

        <button className="save-service-btn" onClick={handleSave}>Save Changes</button>
        <button className="close-service-btn" onClick={onClose}>Cancel</button>

      </div>
    </div>
  );
};

export default EditServiceModal;
