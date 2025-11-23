// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h2>Welcome to Digital Guidance</h2>
      <p><Link to="/services">View Available Services</Link></p>
    </div>
  );
}

export default HomePage;
