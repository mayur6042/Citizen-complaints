const express = require("express");
const Complaint = require("../models/complaint");
const auth = require("../middleware/auth"); // optional, if auth is required
const upload = require("../middleware/upload"); // optional, for file uploads

const router = express.Router();

// ========================
// Helper: Generate Sequential Complaint ID (001, 002, ...)
// ========================
const generateSequentialId = async () => {
  const lastComplaint = await Complaint.findOne().sort({ createdAt: -1 }).select("complaintId");
  if (!lastComplaint) return "001"; // first complaint

  // Parse the numeric ID and increment
  const lastIdNum = parseInt(lastComplaint.complaintId, 2);
  const nextId = (lastIdNum + 1).toString().padStart(3, "0");

  return nextId;
};

// ========================
// CREATE Complaint
// ========================
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    // Generate sequential complaint ID
    const complaintId = await generateSequentialId();


    const complaint = new Complaint({
      complaintId,
      name,
      email,
      category,
      subject,
      message,
      image: req.file ? req.file.path : null,
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId,
    });
  } catch (err) {
    console.error("❌ Error submitting complaint:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================
// GET all complaints (Admin Dashboard)
// ========================
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Error fetching complaints:", err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ========================
// GET complaint by ID (Track Complaint)
// ========================
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    res.json({
      complaintId: complaint.complaintId,
      name: complaint.name,
      email: complaint.email,
      category: complaint.category,
      subject: complaint.subject,
      message: complaint.message,
      status: complaint.status,
      createdAt: complaint.createdAt,
    });
  } catch (err) {
    console.error("❌ Error fetching complaint:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
