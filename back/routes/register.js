const express = require("express");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // your User model
const router = express.Router();

// POST /api/register
router.post("/", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Respond with success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error, please try again later" });
  }
});

module.exports = router;
