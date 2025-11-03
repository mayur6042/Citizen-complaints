// TrackComplaint.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setComplaintId(e.target.value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintId) {
      setError("Please enter a complaint ID.");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/${encodeURIComponent(
          complaintId
        )}`
      );

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const errData = await res.json();
          throw new Error(errData.error || `Server returned ${res.status}`);
        } else {
          const text = await res.text();
          if (text.trim().startsWith("<")) {
            throw new Error(
              `Server returned HTML (likely wrong route). Status ${res.status}`
            );
          }
          throw new Error(text || `Server returned ${res.status}`);
        }
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setComplaint(data);
      } else {
        throw new Error("Unexpected response type from server.");
      }
    } catch (err) {
      setError(err.message || "Error fetching complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: 3,
        background: "linear-gradient(180deg,#e8f0ff 0%, #ffffff 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 680,
          mt: 8,
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          boxShadow: "0 12px 40px rgba(37,78,123,0.12)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: "#1e3a8a",
            mb: 3,
            fontSize: { xs: "1.25rem", sm: "1.6rem" },
          }}
        >
          Track Your Complaint
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            label="Enter Complaint ID (e.g. 013)"
            value={complaintId}
            onChange={handleChange}
            fullWidth
            required
            sx={{
              backgroundColor: "#fff",
              borderRadius: 1,
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              minWidth: 140,
              height: 48,
              background: "linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)",
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Track"
            )}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !complaint && (
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            Searching for complaint...
          </Typography>
        )}

        {complaint && (
          <Paper
            elevation={3}
            sx={{
              mt: 3,
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              backgroundColor: "#fff",
              boxShadow: "0 8px 30px rgba(33, 150, 243, 0.06)",
              borderLeft: "6px solid",
              borderLeftColor:
                complaint.status === "Resolved"
                  ? "#2e7d32"
                  : complaint.status === "In Progress"
                  ? "#f9a825"
                  : "#1565c0",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                mb: 1,
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              Complaint Details
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <Typography>
                <strong>Complaint ID:</strong> {complaint.complaintId}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 16,
                    color: "#fff",
                    background:
                      complaint.status === "Resolved"
                        ? "#2e7d32"
                        : complaint.status === "In Progress"
                        ? "#f9a825"
                        : "#1565c0",
                    minWidth: 100,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {complaint.status}
                </span>
              </Typography>

              <Typography>
                <strong>Name:</strong> {complaint.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {complaint.email}
              </Typography>

              <Typography>
                <strong>Category:</strong> {complaint.category}
              </Typography>
              <Typography>
                <strong>Subject:</strong> {complaint.subject}
              </Typography>

              <Typography sx={{ gridColumn: "1 / -1" }}>
                <strong>Message:</strong>
                <div
                  style={{
                    marginTop: 6,
                    whiteSpace: "pre-wrap",
                    color: "#333",
                  }}
                >
                  {complaint.message}
                </div>
              </Typography>

              <Typography sx={{ gridColumn: "1 / -1" }}>
                <strong>Submitted:</strong>{" "}
                {new Date(complaint.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>

            {complaint.status === "Resolved" && (
              <Box sx={{ mt: 3 }}>
                <Button
                  href={`http://localhost:5000/api/complaints/${complaint.complaintId}/report`}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    "&:hover": { backgroundColor: "#e8f5e9" },
                    minWidth: 200,
                  }}
                >
                  📄 Download Report
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default TrackComplaint;
