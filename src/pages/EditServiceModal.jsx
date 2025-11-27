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
    content: [], // now includes video per step
  });

  const [stepVideos, setStepVideos] = useState([]); // 🔥 — holds new uploaded videos
  const backendURL = "https://digital-guidance-api.onrender.com";

  // ==============================
  // LOAD SERVICE + STEPS
  // ==============================
  useEffect(() => {
    if (serviceId) {
      axios.get(`${backendURL}/api/services/${serviceId}`)
        .then((res) => {
          const data = res.data;
          let parsedSteps = [];

          try {
            parsedSteps = JSON.parse(data.content);
            if (!Array.isArray(parsedSteps)) throw new Error();
          } catch {
            parsedSteps = [{ title: "Step 1", content: data.content || "", video:"" }];
          }

          parsedSteps = parsedSteps.map((step, i) => ({
            title: step.title || `Step ${i + 1}`,
            content: step.content || "",
            formFile: step.formFile || "",
            video: step.video || ""   // 🔥 Store video filename
          }));

          setService(data);
          setForm({ name:data.name, description:data.description, description2:data.description2, content:parsedSteps });
        });
    }
  }, [serviceId]);


  // ==============================
  // STEP VIDEO UPLOAD
  // ==============================
  const handleStepVideoUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await axios.post(`${backendURL}/api/services/upload/video`, formData, {
        headers:{ "Content-Type":"multipart/form-data" }
      });

      const updated = [...form.content];
      updated[index].video = res.data.filename;
      setForm({ ...form, content:updated });

      // preview locally
      const previewList = [...stepVideos];
      previewList[index] = URL.createObjectURL(file);
      setStepVideos(previewList);

      alert("🎥 Step video uploaded successfully!");
    } catch {
      alert("Upload failed");
    }
  };


  // ==============================
  // SAVE CHANGES
  // ==============================
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("description2", form.description2);
      formData.append("content", JSON.stringify(form.content)); // videos included

      await axios.put(`${backendURL}/api/services/${serviceId}`, formData, {
        headers:{ "Content-Type":"multipart/form-data" }
      });

      alert("✅ Service Updated");
      onSave();
    } catch {
      alert("Update failed");
    }
  };

  if (!service) return <div>Loading...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal modal-large" style={{width:"95%",maxWidth:"1200px",padding:"30px"}}>
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Edit Service: <span>{form.name}</span></h2>

        <div style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>


{/* ============= LEFT PREVIEW ============= */}
<div style={{flex:"1.2",background:"#f8fff8",padding:"15px",borderRadius:"10px",overflowY:"auto"}}>
  
  <h2 style={{color:"#1C7C0F"}}>{form.name}</h2>
  <p>{form.description}</p>

  {form.description2 && <p style={{marginTop:"10px",whiteSpace:"pre-line",fontStyle:"italic"}}>{form.description2}</p>}

  {form.content.map((step,i)=>(
    <div key={i} style={{marginBottom:"18px"}}>
      <h4 style={{color:"#1C7C0F"}}>{step.title}</h4>
      <p style={{whiteSpace:"pre-line"}}>{step.content}</p>

      {/* 🔥 Step Video Preview */}
      {step.video && (
        <video controls style={{width:"100%",borderRadius:"10px",marginTop:"6px"}}>
          <source src={`${backendURL}/videos/${step.video}`} type="video/mp4"/>
        </video>
      )}
    </div>
  ))}
</div>



{/* ============= RIGHT FORM ============= */}
<div style={{flex:"1",display:"flex",flexDirection:"column",gap:"12px"}}>

  <label>Service Name</label>
  <input name="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
  
  <label>Description (top)</label>
  <textarea rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>

  <label>Description (bottom)</label>
  <textarea rows="3" value={form.description2} onChange={(e)=>setForm({...form,description2:e.target.value})}/>


{/* ▌STEP FIELDS + NEW VIDEO UPLOAD ▌ */}
{form.content.map((step,index)=>(
  <div key={index} style={{background:"#f4fff4",padding:"10px",borderRadius:"10px",border:"1px solid #bde3b2"}}>

    <input type="text" value={step.title}
      onChange={(e)=>{const u=[...form.content];u[index].title=e.target.value;setForm({...form,content:u})}}/>

    <textarea rows="5" value={step.content}
      onChange={(e)=>{const u=[...form.content];u[index].content=e.target.value;setForm({...form,content:u})}}/>


  {/* 🔥UPLOAD STEP VIDEO HERE */}
    <label>🎥 Upload Step Video</label>
    <input type="file" accept="video/*" onChange={(e)=>handleStepVideoUpload(index,e)}/>

    {stepVideos[index] && (
      <video controls style={{width:"100%",borderRadius:"8px",marginTop:"5px"}}>
        <source src={stepVideos[index]} type="video/mp4"/>
      </video>
    )}
  </div>
))}



  <button onClick={handleSave} style={{background:"#1C7C0F",color:"white",borderRadius:"25px",padding:"10px"}}>💾 Save</button>
</div>

</div>
      </div>
    </div>
  );
}

export default EditServiceModal;
