import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Page imports
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Complaint from "./pages/Complaints";
import Login from "./pages/Login";
import TrackComplaint from "./pages/TrackComplaint";
import RegisterForm from "./pages/RegisterForm";
import Feedback from "./pages/FeedbackPage"; // ✅ import the feedback page

const App = () => (
  <Router>
    <Routes>
      {/* Redirect root to registration */}
      <Route path="/" element={<Navigate to="/register" replace />} />

      {/* Public routes */}
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/complaint" element={<Complaint />} />
      <Route path="/track" element={<TrackComplaint />} />

      {/* Feedback route */}
      <Route path="/feedback/:complaintId" element={<Feedback />} /> {/* ✅ Correct route */}

      {/* Admin routes */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Catch-all route: redirect unknown paths to register */}
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  </Router>
);

export default App;
