// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import ManageServices from "./pages/ManageServices";
import ManageUsers from "./pages/ManageUsers";
import ViewFeedback from "./pages/ViewFeedback";
import ManageCarousel from "./pages/ManageCarousel";

// User & Auth Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

// Dynamic Service Page (replaces all Catering, Gym, etc.)
import ServiceDetails from "./pages/ServiceDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelectionPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          


          {/* User Protected Routes */}
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW Dynamic Service Details Page */}
          <Route
            path="/services/:id"
            element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <ManageServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute>
                <ViewFeedback />
              </ProtectedRoute>
            }
          />
          <Route
              path="/admin/manage-carousel"
            element={
              <ProtectedRoute>
                <ManageCarousel />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
