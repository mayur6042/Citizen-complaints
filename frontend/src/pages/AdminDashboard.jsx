import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  // Fetch complaints
  useEffect(() => {
    fetch("http://localhost:5000/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setFilteredComplaints(data);
      })
      .catch((err) => console.error("Error fetching complaints:", err));
  }, []);

  // Fetch feedbacks
  useEffect(() => {
    fetch("http://localhost:5000/api/feedbacks")
      .then((res) => res.json())
      .then((data) => setFeedbacks(data))
      .catch((err) => console.error("Error fetching feedbacks:", err));
  }, []);

  // Filter complaints
  useEffect(() => {
    if (statusFilter === "All") setFilteredComplaints(complaints);
    else
      setFilteredComplaints(
        complaints.filter((c) => c.status === statusFilter)
      );
  }, [statusFilter, complaints]);

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === id ? { ...c, status: newStatus } : c
          )
        );
      } else console.error(data.error || "Failed to update status");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin-login", { replace: true });
  };

  return (
    <Box className="admin-dashboard">
      {/* ===== HEADER ===== */}
      <Box className="admin-header-bar">
        <Typography className="admin-header">🛠️ Admin Dashboard</Typography>
        <Button
          onClick={handleLogout}
          sx={{
            position: "absolute",
            right: 30,
            backgroundColor: "red",
            color: "white",
            fontWeight: "bold",
            borderRadius: "6px",
            px: 2,
            "&:hover": { backgroundColor: "#c62828" },
          }}
        >
          Logout
        </Button>
      </Box>

      {/* ===== FILTER BAR ===== */}
      <Box className="filter-bar">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Registered">Registered</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ===== COMPLAINTS TABLE ===== */}
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Complaint ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Change Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No complaints found.
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint._id}>
                  <TableCell>{complaint.complaintId}</TableCell>
                  <TableCell>{complaint.name}</TableCell>
                  <TableCell>{complaint.email}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>{complaint.subject}</TableCell>
                  <TableCell>
                    <Typography
                      className={`status-tag ${
                        complaint.status === "Resolved"
                          ? "status-resolved"
                          : complaint.status === "In Progress"
                          ? "status-inprogress"
                          : "status-registered"
                      }`}
                    >
                      {complaint.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={complaint.status}
                      onChange={(e) =>
                        handleStatusChange(
                          complaint.complaintId,
                          e.target.value
                        )
                      }
                      size="small"
                      className="status-select"
                    >
                      <MenuItem value="Registered">Registered</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===== FEEDBACK SECTION ===== */}
      <Box className="admin-section">
        <Typography className="section-title">💬 Citizen Feedback</Typography>
        <Box className="feedback-list">
          {feedbacks.length === 0 ? (
            <Typography align="center" sx={{ color: "#555", mt: 2 }}>
              No feedback received yet.
            </Typography>
          ) : (
            feedbacks.map((fb) => (
              <Box key={fb._id} className="feedback-card">
                <Typography>
                  <strong>Complaint ID:</strong> {fb.complaintId}
                </Typography>
                <Typography>
                  <strong>Rating:</strong> ⭐ {fb.rating}/5
                </Typography>
                <Typography className="feedback-comment">
                  "{fb.comment}"
                </Typography>
                <Typography className="feedback-meta">
                  Submitted by {fb.name || "Anonymous"} on{" "}
                  {new Date(fb.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* ===== INLINE CSS ===== */}
      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #ede7f6, #d1c4e9);
          padding: 60px 50px;
          font-family: "Poppins", sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .admin-header-bar {
          width: 100%;
          max-width: 1200px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(10px);
          padding: 18px 30px;
          border-radius: 14px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 40px;
          animation: fadeInDown 0.8s ease;
        }
        .admin-header {
          font-size: 2rem;
          font-weight: 700;
          color: #4b0082;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .filter-bar {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 25px;
        }
        .table-container {
          width: 100%;
          max-width: 1200px;
          border-radius: 14px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
          overflow: hidden;
          animation: fadeInUp 1s ease;
          margin-bottom: 40px;
        }
        .MuiTableHead-root {
          background: #6a1b9a !important;
        }
        .MuiTableHead-root .MuiTableCell-root {
          color: #fff !important;
          font-weight: 600 !important;
        }
        .MuiTableBody-root .MuiTableRow-root:hover {
          background-color: #f3e5f5 !important;
        }
        .status-tag {
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 25px;
          color: white;
          display: inline-block;
          min-width: 110px;
          text-align: center;
        }
        .status-registered { background: linear-gradient(90deg, #1976d2, #64b5f6); }
        .status-inprogress { background: linear-gradient(90deg, #ffb300, #ffe082); color: #263238; }
        .status-resolved { background: linear-gradient(90deg, #43a047, #81c784); }
        .admin-section {
          width: 100%;
          max-width: 1200px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 14px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          padding: 30px;
          animation: fadeInUp 1s ease;
        }
        .section-title {
          text-align: center;
          color: #2e3b55;
          font-weight: 600;
          font-size: 1.4rem;
          margin-bottom: 20px;
        }
        .feedback-list { display: flex; flex-direction: column; gap: 16px; }
        .feedback-card {
          background: #f9f9ff;
          border-left: 6px solid #4b0082;
          border-radius: 10px;
          padding: 16px 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feedback-card:hover {
          transform: scale(1.01);
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }
        .feedback-comment { font-style: italic; color: #333; margin-top: 8px; }
        .feedback-meta { color: #777; font-size: 0.85rem; margin-top: 6px; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-25px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Box>
  );
};

export default AdminDashboard;
