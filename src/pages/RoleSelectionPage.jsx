// src/pages/RoleSelectionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelectionPage.css'; 

function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      <img
        src="/nvsu-logo.gif" 
        alt="NVSU Logo"
        className="logo"
      />
      <h2>Nueva Vizcaya State University</h2>
      <h3>Auxiliary Services Program</h3>
      <p>Bayombong, Nueva Vizcaya</p>

      <div className="button-group">
        <button onClick={() => navigate('/login?role=admin')}>Administrator</button>
        <button onClick={() => navigate('/login?role=user')}>User</button>

      </div>
    </div>
  );
}

export default RoleSelectionPage;
