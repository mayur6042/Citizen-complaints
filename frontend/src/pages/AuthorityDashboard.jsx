import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./AuthorityDashboard.css";

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const department = localStorage.getItem("authority_department");

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  useEffect(() => {
    if (!department) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`http://localhost:5000/api/authority-complaints/${department}`)
      .then((res) => res.json())
      .then(setComplaints)
      .catch(console.error);
  }, [department, navigate]);

  // -----------------------------
  // STATUS CHANGE
  // -----------------------------
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/authority-complaints/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === id ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("authority_department");
    navigate("/authority-login", { replace: true });
  };

  // -----------------------------
  // FILTER + SEARCH
  // -----------------------------
  const filtered = complaints.filter((c) => {
    const matchStatus = filter === "All" || c.status === filter;
    const matchSearch =
      c.complaintId.includes(search) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <Box className="authority-dashboard">
      {/* HEADER */}
      <Paper className="authority-header">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {department} — Authority Dashboard
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>

      {/* FILTERS */}
      <Box className="authority-filters">
        <TextField
          label="Search by ID or Subject"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ ml: 2 }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Registered">Registered</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
        </Select>
      </Box>

      {/* TABLE */}
      <Table component={Paper} className="authority-table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Citizen</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Attachment</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Change</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filtered.length ? (
            filtered.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.complaintId}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.subject}</TableCell>

                {/* VIEW FILE */}
                <TableCell>
                  {c.filePath ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        window.open(
                          `http://localhost:5000${c.filePath}`,
                          "_blank"
                        )
                      }
                    >
                      View File
                    </Button>
                  ) : (
                    "No File"
                  )}
                </TableCell>

                <TableCell>{c.status}</TableCell>

                <TableCell>
                  <Select
                    value={c.status}
                    size="small"
                    onChange={(e) =>
                      handleStatusChange(c.complaintId, e.target.value)
                    }
                  >
                    <MenuItem value="Registered">Registered</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No complaints found for your department.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AuthorityDashboard;
