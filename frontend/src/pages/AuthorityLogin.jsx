import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./AuthorityLogin.css";

const AuthorityLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/authority-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("authority_department", data.department);
        navigate("/authority-dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <Box className="auth-login-container">
      <Paper className="auth-login-card">
        <Typography className="auth-login-title">Authority Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} />
          <TextField label="Password" name="password" type="password" fullWidth margin="normal" onChange={handleChange} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Login</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AuthorityLogin;
