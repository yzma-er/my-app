// src/config.js
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"        // ✅ if running on your PC
    : "https://digital-guidance-api.onrender.com"; 
    
    
    // ✅ if accessed from your phone
    //"http://192.168.0.90:5000"

export default API_BASE_URL;
