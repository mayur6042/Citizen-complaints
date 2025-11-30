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
      return res.status(200).json({ registered: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // SUCCESS ➜ send fullname because frontend needs it
    res.status(200).json({
      registered: true,
      fullname: user.fullname,
      email: user.email,
      token: "dummy-token"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
