import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Rating,
  Divider,
} from "@mui/material";

const AdminFeedbackViewer = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/feedbacks");
        const data = await res.json();
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      sx={{
        p: 4,
        mt: 4,
        backgroundColor: "#fafafa",
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#512da8" }}>
        User Feedbacks
      </Typography>

      {feedbacks.length === 0 ? (
        <Typography>No feedbacks submitted yet.</Typography>
      ) : (
        feedbacks.map((f) => (
          <Box
            key={f._id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "#fff",
            }}
          >
            <Typography variant="subtitle1">
              <strong>Complaint ID:</strong> {f.complaintId}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Rating value={f.rating} precision={0.5} readOnly />
              <Typography sx={{ ml: 1 }}>({f.rating}/5)</Typography>
            </Box>
            <Typography sx={{ mt: 1 }}>
              <strong>Comment:</strong> {f.comment || "No comment provided"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Submitted:{" "}
              {new Date(f.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Paper>
  );
};

export default AdminFeedbackViewer;
