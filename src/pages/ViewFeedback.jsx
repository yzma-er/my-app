// src/pages/ViewFeedback.jsx - CaOMPLETE with jspdf
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewFeedback.css";
import StepRatingsModal from "../components/StepRatingsModal";

// Import jspdf - Make sure these are installed
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

function ViewFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("All Services");
  const navigate = useNavigate();

  // For modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stepRatings, setStepRatings] = useState([]);

  // Report generation states
  const [reportType, setReportType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingReport, setLoadingReport] = useState(false);

  const backendURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://digital-guidance-api.onrender.com";

  // memoized fetch functions
  const fetchFeedback = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/feedback`);
      setFeedback(res.data);
    } catch (err) {
      console.error("❌ Error fetching feedback:", err);
    }
  }, [backendURL]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error("❌ Error fetching services:", err);
    }
  }, [backendURL]);

  useEffect(() => {
    fetchFeedback();
    fetchServices();
  }, [fetchFeedback, fetchServices]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`${backendURL}/api/feedback/${id}`);
      fetchFeedback();
    } catch (err) {
      console.error("❌ Error deleting feedback:", err);
    }
  };

  // Filtered feedback based on service filter
  const filteredFeedback =
    filter === "All Services"
      ? feedback
      : feedback.filter(
          (f) =>
            f.service_name?.trim().toLowerCase() === filter.trim().toLowerCase()
        );

  // Get feedback filtered by date range for reports
  const getDateFilteredFeedback = () => {
    const now = new Date();
    let startDate, endDate;

    switch (reportType) {
      case "monthly":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0);
        break;
      case "semi-annually":
        const isFirstHalf = selectedMonth <= 6;
        startDate = new Date(selectedYear, isFirstHalf ? 0 : 6, 1);
        endDate = new Date(selectedYear, isFirstHalf ? 5 : 11, 31);
        break;
      case "annually":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
      default:
        return filteredFeedback;
    }

    return filteredFeedback.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculate statistics for report
  const calculateStatistics = (feedbackList) => {
    if (feedbackList.length === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        serviceCounts: {},
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = feedbackList.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / feedbackList.length;
    
    const serviceCounts = {};
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedbackList.forEach((item) => {
      // Count by service
      const serviceName = item.service_name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      
      // Count by rating
      ratingDistribution[item.rating]++;
    });

    return {
      totalFeedbacks: feedbackList.length,
      averageRating: averageRating.toFixed(2),
      serviceCounts,
      ratingDistribution,
    };
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    setLoadingReport(true);
    
    try {
      const reportFeedback = getDateFilteredFeedback();
      const stats = calculateStatistics(reportFeedback);
      
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20;
      
      // Add header with logo and title
      doc.setFillColor(28, 124, 15);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Feedback Report", pageWidth / 2, 25, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: "center" });
      
      // Report period info
      yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Report Period: ${getReportPeriodText()}`, 14, yPos);
      
      // Statistics section
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 14, yPos);
      
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.text(`Total Feedbacks: ${stats.totalFeedbacks}`, 20, yPos);
      yPos += 7;
      doc.text(`Average Rating: ${stats.averageRating}/5`, 20, yPos);
      
      // Rating distribution
      yPos += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Rating Distribution:", 14, yPos);
      
      yPos += 7;
      doc.setFont("helvetica", "normal");
      Object.entries(stats.ratingDistribution).forEach(([rating, count]) => {
        const stars = "★".repeat(parseInt(rating)) + "☆".repeat(5 - parseInt(rating));
        doc.text(`${stars} (${rating}/5): ${count} feedbacks`, 20, yPos);
        yPos += 7;
      });
      
      // Service breakdown
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Service Breakdown:", 14, yPos);
      
      yPos += 7;
      doc.setFont("helvetica", "normal");
      Object.entries(stats.serviceCounts).forEach(([service, count]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${service}: ${count} feedbacks`, 20, yPos);
        yPos += 7;
      });
      
      // Detailed feedback table
      if (reportFeedback.length > 0) {
        yPos += 10;
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text("Detailed Feedback", 14, yPos);
        yPos += 10;
        
        const tableData = reportFeedback.map((item, index) => [
          index + 1,
          item.user_email || "Anonymous",
          item.service_name || "—",
          item.step_number ? `Step ${item.step_number}` : "—",
          "★".repeat(item.rating) + "☆".repeat(5 - item.rating),
          item.comment ? item.comment.substring(0, 50) + (item.comment.length > 50 ? "..." : "") : "No comment",
          new Date(item.created_at).toLocaleDateString(),
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [["#", "User Email", "Service", "Step", "Rating", "Comment", "Date"]],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [28, 124, 15] },
          styles: { fontSize: 8, cellPadding: 2 },
          margin: { left: 14, right: 14 },
        });
      } else {
        yPos += 20;
        doc.text("No feedback available for selected period.", 14, yPos);
      }
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, doc.internal.pageSize.height - 10);
        doc.text("Digital Guidance System", 20, doc.internal.pageSize.height - 10);
      }
      
      // Save PDF
      doc.save(`Feedback_Report_${getReportPeriodText().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setLoadingReport(false);
    }
  };

  // Helper function to get report period text
  const getReportPeriodText = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    switch (reportType) {
      case "monthly":
        return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
      case "semi-annually":
        const half = selectedMonth <= 6 ? "First Half" : "Second Half";
        return `${half} ${selectedYear}`;
      case "annually":
        return `Year ${selectedYear}`;
      default:
        return "Custom Period";
    }
  };

  // Open modal and load step ratings
  const openStepRatings = async (service) => {
    setSelectedService(service);
    try {
      const res = await axios.get(`${backendURL}/api/feedback/step-ratings/${encodeURIComponent(service.name)}`);
      setStepRatings(res.data);
    } catch (err) {
      console.error("❌ Error loading step ratings:", err);
      setStepRatings([]);
    }
    setModalOpen(true);
  };

  // Generate months array for dropdown
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years array (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Get current report data
  const reportData = getDateFilteredFeedback();
  const stats = calculateStatistics(reportData);

  return (
    <div className="feedback-container">
      
      {/* Back button */}
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

      <h2>📋 Feedback Records</h2>

      {/* Report Generation Section */}
      <div className="report-section">
        <h3>📊 Generate Report</h3>
        <div className="report-controls">
          <div className="control-group">
            <label>Report Type:</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="report-select"
            >
              <option value="monthly">Monthly Report</option>
              <option value="semi-annually">Semi-Annual Report</option>
              <option value="annually">Annual Report</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Month:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="report-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="report-select"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <button 
              onClick={generatePDFReport} 
              className="generate-report-btn"
              disabled={loadingReport}
            >
              {loadingReport ? "⏳ Generating..." : "📥 Download PDF Report"}
            </button>
          </div>
        </div>
        
        <div className="report-preview">
          <p className="report-period">
            Selected Period: <strong>{getReportPeriodText()}</strong>
          </p>
          <p className="report-stats">
            Feedbacks in period: <strong>{reportData.length}</strong> | 
            Average Rating: <strong>{stats.averageRating}/5</strong>
          </p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h3>Average Ratings per Service</h3>
        <div className="summary-grid">
          {services.map((s) => {
            const serviceFeedback = feedback.filter(
              (f) =>
                f.service_name?.trim().toLowerCase() === s.name.trim().toLowerCase()
            );
            const avg =
              serviceFeedback.length > 0
                ? (
                    serviceFeedback.reduce((sum, f) => sum + f.rating, 0) /
                    serviceFeedback.length
                  ).toFixed(1)
                : "N/A";
            const count = serviceFeedback.length;
            
            return (
              <div
                key={s.service_id}
                className="summary-card"
                onClick={() => openStepRatings(s)}
                style={{ cursor: "pointer" }}
              >
                <strong>{s.name}</strong>
                <p>
                  ⭐ {avg}{" "}
                  <span style={{ fontSize: "13px", color: "#555" }}>
                    ({count} feedbacks)
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="filter-container">
        <label>Filter by Service:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All Services">All Services</option>
          {services.map((s) => (
            <option key={s.service_id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback Table */}
      <table className="feedback-table">
        <thead>
          <tr>
            <th>User Email</th>
            <th>Service</th>
            <th>Step</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <tr key={item.feedback_id}>
                <td>
                  {item.user_email ? (
                    <span title={`User ID: ${item.user_id}`}>
                      {item.user_email}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      Anonymous
                    </span>
                  )}
                </td>
                <td>{item.service_name || "—"}</td>
                <td>{item.step_number ? `Step ${item.step_number}` : "—"}</td>
                <td>
                  <span style={{ color: '#ffa500' }}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                    ({item.rating}/5)
                  </span>
                </td>
                <td>{item.comment || "No comment"}</td>
                <td>
                  {new Date(item.created_at).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.feedback_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No feedback available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Step Ratings Modal */}
      <StepRatingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={selectedService?.name}
        stepRatings={stepRatings}
      />
    </div>
  );
}

export default ViewFeedback;
