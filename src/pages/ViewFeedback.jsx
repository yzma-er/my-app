// src/pages/ViewFeedback.jsx - WORKING VERSION WITHOUT jspdf-autotable
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewFeedback.css";
import StepRatingsModal from "../components/StepRatingsModal";

// CORRECT: Only jsPDF, NO autotable
import { jsPDF } from "jspdf";

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
    let startDate, endDate;

    switch (reportType) {
      case "monthly":
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        break;
      case "semi-annually":
        const isFirstHalf = selectedMonth <= 6;
        startDate = new Date(selectedYear, isFirstHalf ? 0 : 6, 1);
        endDate = new Date(selectedYear, isFirstHalf ? 5 : 11, 31, 23, 59, 59, 999);
        break;
      case "annually":
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        break;
      default:
        return filteredFeedback;
    }

    // Helper function to parse dates correctly
    const parseFeedbackDate = (dateString) => {
      if (!dateString) return null;
      
      // If it's already a Date object
      if (dateString instanceof Date) return dateString;
      
      try {
        // Try parsing as ISO string first
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;
        
        // Try parsing "MM/DD/YY, HH:MM:SS AM/PM" format
        if (typeof dateString === 'string' && dateString.includes('/')) {
          const [datePart, timePart] = dateString.split(', ');
          const [month, day, yearShort] = datePart.split('/').map(Number);
          const year = yearShort < 100 ? yearShort + 2000 : yearShort;
          
          let hour = 0, minute = 0, second = 0;
          if (timePart) {
            const [time, period] = timePart.split(' ');
            const [h, m, s] = time.split(':').map(Number);
            hour = period?.toUpperCase() === 'PM' && h < 12 ? h + 12 : h;
            minute = m || 0;
            second = s || 0;
          }
          
          return new Date(year, month - 1, day, hour, minute, second);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
      
      return null;
    };

    return filteredFeedback.filter((item) => {
      try {
        const itemDate = parseFeedbackDate(item.created_at);
        if (!itemDate || isNaN(itemDate.getTime())) return false;
        return itemDate >= startDate && itemDate <= endDate;
      } catch (error) {
        console.error("Error filtering date:", error);
        return false;
      }
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

    const validFeedback = feedbackList.filter(item => 
      item.rating >= 1 && item.rating <= 5
    );
    
    const totalRating = validFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = validFeedback.length > 0 ? totalRating / validFeedback.length : 0;
    
    const serviceCounts = {};
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    validFeedback.forEach((item) => {
      const serviceName = item.service_name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      const rating = Math.min(Math.max(1, item.rating), 5);
      ratingDistribution[rating]++;
    });

    return {
      totalFeedbacks: validFeedback.length,
      averageRating: averageRating.toFixed(2),
      serviceCounts,
      ratingDistribution,
    };
  };

  // Professional layout with full data display
const generatePDFReport = async () => {
  if (feedback.length === 0) {
    alert("⚠️ Please wait for feedback data to load before generating report.");
    return;
  }
  
  setLoadingReport(true);
  
  try {
    const reportFeedback = getDateFilteredFeedback();
    const stats = calculateStatistics(reportFeedback);
    
    // Create PDF in landscape for better table layout
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    
    // Header with company branding
    doc.setFillColor(28, 124, 15);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Feedback Analysis Report", pageWidth / 2, 25, { align: "center" });
    
    doc.setFontSize(11);
    doc.text(`Period: ${getReportPeriodText()} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: "center" });
    
    // Executive Summary section
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`• Total Feedbacks Analyzed: ${stats.totalFeedbacks}`, 20, yPos);
    yPos += 8;
    doc.text(`• Average Customer Satisfaction: ${stats.averageRating}/5`, 20, yPos);
    yPos += 8;
    doc.text(`• Report Period: ${getReportPeriodText()}`, 20, yPos);
    
    // Rating Distribution as percentage
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Customer Satisfaction Distribution:", 14, yPos);
    
    yPos += 8;
    doc.setFont("helvetica", "normal");
    Object.entries(stats.ratingDistribution).forEach(([rating, count]) => {
      const percentage = stats.totalFeedbacks > 0 ? 
        ((count / stats.totalFeedbacks) * 100).toFixed(1) : 0;
      doc.text(`  ${rating} Stars: ${count} (${percentage}%)`, 20, yPos);
      yPos += 7;
    });
    
    // Service Performance
    if (Object.keys(stats.serviceCounts).length > 0) {
      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Service Performance Summary:", 14, yPos);
      
      yPos += 8;
      doc.setFont("helvetica", "normal");
      Object.entries(stats.serviceCounts).forEach(([service, count]) => {
        if (yPos > 250) {
          doc.addPage('landscape');
          yPos = 20;
        }
        doc.text(`  ${service}: ${count} feedback${count !== 1 ? 's' : ''}`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Detailed Feedback Records - FULL DATA DISPLAY
    if (reportFeedback.length > 0) {
      // Start new page for detailed records
      doc.addPage('landscape');
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Feedback Records", 14, yPos);
      doc.setFontSize(10);
      doc.text(`Showing ${Math.min(reportFeedback.length, 25)} of ${reportFeedback.length} records`, 14, yPos + 6);
      
      yPos += 15;
      
      // Create a clean table with full data
      const colWidths = {
        num: 20,
        email: 80,
        service: 50,
        step: 30,
        rating: 30,
        date: 40,
        comment: 60
      };
      
      // Table Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("#", 14, yPos);
      doc.text("USER EMAIL", 14 + colWidths.num, yPos);
      doc.text("SERVICE", 14 + colWidths.num + colWidths.email, yPos);
      doc.text("STEP", 14 + colWidths.num + colWidths.email + colWidths.service, yPos);
      doc.text("RATING", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step, yPos);
      doc.text("DATE", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step + colWidths.rating, yPos);
      doc.text("COMMENT", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step + colWidths.rating + colWidths.date, yPos);
      
      // Header line
      yPos += 3;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 7;
      
      // Table Rows with FULL email display
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      reportFeedback.slice(0, 25).forEach((item, index) => {
        if (yPos > 260) {
          doc.addPage('landscape');
          yPos = 20;
          // Redraw header
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("#", 14, yPos);
          doc.text("USER EMAIL", 14 + colWidths.num, yPos);
          doc.text("SERVICE", 14 + colWidths.num + colWidths.email, yPos);
          doc.text("STEP", 14 + colWidths.num + colWidths.email + colWidths.service, yPos);
          doc.text("RATING", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step, yPos);
          doc.text("DATE", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step + colWidths.rating, yPos);
          doc.text("COMMENT", 14 + colWidths.num + colWidths.email + colWidths.service + colWidths.step + colWidths.rating + colWidths.date, yPos);
          yPos += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
        }
        
        let currentX = 14;
        
        // Row number
        doc.text(`${index + 1}`, currentX, yPos);
        currentX += colWidths.num;
        
        // Email (FULL - split into multiple lines if needed)
        const email = item.user_email || "Anonymous";
        const emailLines = splitTextIntoLines(email, colWidths.email - 5);
        emailLines.forEach((line, lineIndex) => {
          doc.text(line, currentX, yPos + (lineIndex * 4));
        });
        currentX += colWidths.email;
        
        // Service (truncate if too long)
        const service = item.service_name || "—";
        doc.text(service.length > 20 ? service.substring(0, 20) + "..." : service, 
                currentX, yPos);
        currentX += colWidths.service;
        
        // Step
        doc.text(item.step_number ? `S${item.step_number}` : "—", currentX, yPos);
        currentX += colWidths.step;
        
        // Rating
        doc.text(`${item.rating}/5`, currentX, yPos);
        currentX += colWidths.rating;
        
        // Date
        doc.text(new Date(item.created_at).toLocaleDateString('en-US'), currentX, yPos);
        currentX += colWidths.date;
        
        // Comment (truncated)
        const comment = item.comment || "No comment";
        doc.text(comment.length > 25 ? comment.substring(0, 25) + "..." : comment, 
                currentX, yPos);
        
        // Move to next row based on email height
        yPos += Math.max(7, emailLines.length * 4 + 3);
      });
      
      if (reportFeedback.length > 25) {
        yPos += 10;
        doc.setFont("helvetica", "italic");
        doc.text(`... and ${reportFeedback.length - 25} additional records available`, 14, yPos);
      }
    }
    
    // Footer on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Digital Guidance System - Confidential`, 20, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save PDF
    const fileName = `Feedback_Report_${getReportPeriodText().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    console.log("Professional PDF report generated!");
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF report. Please try again.");
  } finally {
    setLoadingReport(false);
  }
};

// Helper function to split long text into multiple lines
const splitTextIntoLines = (text, maxWidth) => {
  const lines = [];
  let currentLine = '';
  
  for (const word of text.split(' ')) {
    if ((currentLine + ' ' + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
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
              disabled={loadingReport || feedback.length === 0}
            >
              {loadingReport ? "⏳ Generating..." : 
               feedback.length === 0 ? "📋 Loading data..." : "📥 Download PDF Report"}
            </button>
          </div>
        </div>
        
        <div className="report-preview">
          <p className="report-period">
            Selected Period: <strong>{getReportPeriodText()}</strong>
          </p>
          <p className="report-stats">
            {feedback.length === 0 ? (
              "⏳ Loading feedback data..."
            ) : (
              <>
                Feedbacks in period: <strong>{reportData.length}</strong> | 
                Average Rating: <strong>{stats.averageRating}/5</strong>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Rest of your component remains the same... */}
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
