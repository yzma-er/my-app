import React from "react";
import { useNavigate } from "react-router-dom";

function AboutPage() {

  const navigate = useNavigate(); // 👈 for Back button

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >

      {/* 🔙 Back button */}
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

      <h1 style={{ color: "#104C08", marginBottom: "1.5rem" }}>About</h1>

      <p style={{ marginBottom: "1rem", textAlign: "justify", lineHeight: "1.6" }}>
        This is a Progressive Web App (PWA) designed to help students and staff 
        navigate different school processes and services at NVSU.
      </p>

      <p style={{ marginBottom: "1rem", textAlign: "justify", lineHeight: "1.6" }}>
        The system provides clear, step-by-step instructions for tasks such as ID 
        processing and accessing school facilities like the Gymnasium, DFTC, 
        Mini-Theater, Padilla Hall, Guest House, Staff House, and the university 
        dormitories.
      </p>

      <p style={{ marginBottom: "1rem", textAlign: "justify", lineHeight: "1.6" }}>
        It also includes infographic videos for each step, a feedback rating 
        feature, and downloadable request forms to guide users easily and clearly.
      </p>

      <p style={{ marginBottom: "1rem", textAlign: "justify", lineHeight: "1.6" }}>
        The system currently offers predefined steps, does not support payment 
        transactions, and is available only at the NVSU Main Campus.
      </p>

      <p style={{ marginBottom: "1rem", textAlign: "justify", lineHeight: "1.6" }}>
        Our goal is to make school processes easier, clearer, and more convenient 
        for everyone.
      </p>

    </div>
  );
}

export default AboutPage;
