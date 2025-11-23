import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Not logged in — send back to role selection
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // ✅ Check if accessing an admin route
    const isAdminRoute = location.pathname.startsWith("/admin");

    if (isAdminRoute && userRole !== "admin") {
      // User trying to access admin area
      alert("Access denied: Admins only");
      return <Navigate to="/home" replace />;
    }

    if (!isAdminRoute && userRole === "admin") {
      // Admin trying to access user routes
      alert("Admins cannot access user pages");
      return <Navigate to="/admin" replace />;
    }

    // ✅ Otherwise, access granted
    return children;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
