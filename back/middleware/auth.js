const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = function(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'No token'});
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({error:'Bad authorization header'});
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch(err){
    return res.status(401).json({error:'Invalid token', details: err.message});
  }
};

// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/user"); // your User schema
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ registered: false }); // user not found
    }

    const isMatch = await bcrypt.compare(password, user.password); // assuming passwords are hashed
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // user exists and password is correct
    res.status(200).json({ registered: true, token: "dummy-token" }); // you can add JWT token here
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
