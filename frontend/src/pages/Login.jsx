import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // -------------------------------
  // Handle form input change
  // -------------------------------
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // -------------------------------
  // Handle login submission
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.registered) {
        // ✅ Successful login
        localStorage.setItem("citizen_token", "true");
        localStorage.setItem("citizen_email", form.email);
        localStorage.setItem("citizen_name", data.fullname);
        navigate("/complaint", { replace: true });
      } else if (response.ok && !data.registered) {
        // 🚨 Unregistered user — show message, then redirect
        setError("You are not registered. Redirecting to registration page...");
        setTimeout(() => navigate("/register", { replace: true }), 200);
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Render UI
  // -------------------------------
  return (
    <Box className="login-container">
      <Paper elevation={0} className="login-card" role="main" aria-label="Login form">
        <Typography className="login-title">Public Service Complaint</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="login-form">
          <TextField
            variant="outlined"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            className="login-field"
            autoComplete="email"
          />

          <TextField
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            className="login-field"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </Button>
        </Box>

        {/* Links Section */}
        <Box className="login-links">
          <Typography variant="body2">
            <MuiLink
              component="button"
              onClick={() => navigate("/track")}
              className="login-link"
            >
              🔍 Track your complaint
            </MuiLink>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            <MuiLink
              component="button"
              onClick={() => navigate("/authority-login")}
              className="login-link"
            >
              🏛️ Authority Login
            </MuiLink>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            <MuiLink
              component="button"
              onClick={() => navigate("/admin-login")}
              className="login-link"
            >
              👨‍💼 Admin Login
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
