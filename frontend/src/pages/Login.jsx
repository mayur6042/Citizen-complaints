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

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
  };

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
        localStorage.setItem("citizen_token", "true");
        localStorage.setItem("citizen_email", form.email);
        navigate("/complaint", { replace: true });
      } else if (response.ok && !data.registered) {
        setError("You are not registered. Please register first.");
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Paper elevation={0} className="login-card" role="main" aria-label="login form">
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
