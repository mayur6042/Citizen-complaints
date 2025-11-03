import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./complaints.css";

const categories = [
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Road Maintenance",
  "Public Transport",
  "Health Services",
  "Other",
];

const ComplaintSubmission = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [customCategory, setCustomCategory] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // ✅ Check login + load username
  useEffect(() => {
    const token = localStorage.getItem("citizen_token");
    const email = localStorage.getItem("citizen_email");

    if (!token) {
      navigate("/login", { replace: true });
    } else {
      const namePart = email ? email.split("@")[0] : "User";
      setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const finalCategory =
      form.category === "Other" ? customCategory || "Other" : form.category;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("category", finalCategory);
    formData.append("subject", form.subject);
    formData.append("message", form.message);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess(
        `Complaint submitted successfully! Your ID: ${data.complaintId}`
      );
      setForm({ name: "", email: "", category: "", subject: "", message: "" });
      setCustomCategory("");
      setFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("citizen_token");
    localStorage.removeItem("citizen_email");
    navigate("/login", { replace: true });
  };

  return (
    <Box className="complaint-container">
      {/* ✅ Header with Welcome + Logout */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          👋 Welcome, {userName}
        </Typography>
        <Button
          onClick={handleLogout}
          sx={{
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

      <Box className="complaint-card">
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Submit Complaint
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="email"
            required
          />
          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          {/* ✅ Show custom category input if "Other" is selected */}
          {form.category === "Other" && (
            <TextField
              variant="standard"
              label="Please specify your category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ style: { color: "#666" } }}
              inputProps={{ style: { fontSize: "16px" } }}
            />
          )}

          <TextField
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Image (optional)
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          {file && (
            <Typography
              variant="body2"
              sx={{ mt: 1, fontStyle: "italic", color: "#555" }}
            >
              Selected file: {file.name}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Submit Complaint
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ComplaintSubmission;
