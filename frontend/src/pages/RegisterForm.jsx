import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert, Checkbox, FormControlLabel } from "@mui/material";
import "./RegisterForm.css";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreed) newErrors.agreed = "You must agree to terms";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const res = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (res.ok) {
          setMessage("Registration successful! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setMessage(data.error || "Registration failed");
        }
      } catch {
        setMessage("Server error. Try again later.");
      }
    }
  };

  return (
    <Box className="register-container">
      <Box className="register-card">
        <Typography variant="h5" component="h2" className="register-title">
          Register
        </Typography>

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full Name"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.fullname}
            helperText={errors.fullname}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
              />
            }
            label="I agree to Terms & Conditions"
            className="checkbox-label"
          />
          {errors.agreed && (
            <Typography color="error" sx={{ mb: 1 }}>
              {errors.agreed}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>

        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Already registered?{" "}
          <Link to="/login" className="link-signin">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
