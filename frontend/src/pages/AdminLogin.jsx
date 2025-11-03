import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_CREDENTIALS = {
    email: "admin@example.com",
    password: "admin123",
  };

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin-dashboard", { replace: true });
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (
        form.email === ADMIN_CREDENTIALS.email &&
        form.password === ADMIN_CREDENTIALS.password
      ) {
        localStorage.setItem("admin_token", "authenticated");
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <>
      <style>{`
        /* ===== Main Background ===== */
        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #5e35b1, #7e57c2, #9575cd);
          font-family: "Poppins", sans-serif;
          padding: 30px 15px;
        }

        /* ===== Login Card ===== */
        .admin-login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 18px;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.15);
          padding: 40px 45px;
          text-align: center;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.8s ease;
          transition: all 0.3s ease;
        }

        .admin-login-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
        }

        /* ===== Title ===== */
        .admin-login-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #4527a0;
          margin-bottom: 20px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.08);
          letter-spacing: 0.5px;
        }

        /* ===== Input Fields ===== */
        .admin-login-input .MuiTextField-root {
          margin-bottom: 18px !important;
        }

        .MuiInputBase-root {
          border-radius: 10px !important;
          background-color: #fafafa;
        }

        .MuiInputLabel-root {
          color: #555 !important;
        }

        .MuiInputBase-root:hover fieldset {
          border-color: #673ab7 !important;
        }

        .Mui-focused fieldset {
          border-color: #512da8 !important;
        }

        /* ===== Button ===== */
        .admin-login-button {
          background: linear-gradient(90deg, #512da8, #673ab7) !important;
          color: white !important;
          font-weight: 600 !important;
          text-transform: none !important;
          border-radius: 10px !important;
          padding: 10px 0 !important;
          transition: all 0.3s ease !important;
          margin-top: 8px !important;
        }

        .admin-login-button:hover {
          background: linear-gradient(90deg, #4527a0, #5e35b1) !important;
          transform: translateY(-2px);
        }

        /* ===== Alerts ===== */
        .MuiAlert-root {
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        /* ===== Animation ===== */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ===== Responsive ===== */
        @media (max-width: 480px) {
          .admin-login-card {
            padding: 28px 25px;
          }

          .admin-login-title {
            font-size: 1.6rem;
          }
        }
      `}</style>

      <Box className="admin-login-container">
        <Paper elevation={6} className="admin-login-card">
          <Typography variant="h5" className="admin-login-title">
            Admin Login
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="admin-login-input"
          >
            <TextField
              fullWidth
              label="Email"
              name="email"
              margin="normal"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              margin="normal"
              value={form.password}
              onChange={handleChange}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              className="admin-login-button"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default AdminLogin;
