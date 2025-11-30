require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

// ---------------------------
// Models
// ---------------------------
const User = require("./models/user");
const Complaint = require("./models/complaint");
const Feedback = require("./models/feedback"); // ✅ Add this missing model

// ---------------------------
// App Config
// ---------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ---------------------------
// File Upload Setup
// ---------------------------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ---------------------------
// MongoDB Connection
// ---------------------------
mongoose
  .connect("mongodb://localhost:27017/complaintsDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------------------------
// Email Setup
// ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Department Emails
const departmentEmails = {
  "Water Supply": "vigneshmpai2005@gmail.com",
  Electricity: "vigneshmpai2005@gmail.com",
  Sanitation: "vigneshmpai2005@gmail.com",
  "Road Maintenance": "mayurshenoy02@gmail.com",
  "Public Transport": "vigneshmpai2005@gmail.com",
  "Health Services": "vigneshmpai2005@gmail.com",
  Other: "vigneshmpai2005@gmail.com",
};

// ---------------------------
// Utility: Generate Sequential Complaint ID
// ---------------------------
const generateSequentialId = async () => {
  const last = await Complaint.findOne().sort({ createdAt: -1 });
  const nextId = last && last.complaintId ? parseInt(last.complaintId) + 1 : 1;
  return String(nextId).padStart(3, "0");
};

// ---------------------------
// Routes
// ---------------------------

// Root
app.get("/", (_, res) => res.json({ message: "🚀 Server is running" }));

// ---------------------------
// User Registration
// ---------------------------
app.post("/api/register", async (req, res) => {
  const { fullname, email, password, confirmPassword, agreed } = req.body;

  if (!fullname || !email || !password || !confirmPassword || !agreed)
    return res.status(400).json({ error: "All fields are required." });
  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match." });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ fullname, email, password: hashed }).save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// User Login
// ---------------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ registered: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect password" });

    res.json({
      registered: true,
      token: "dummy-token",
      fullname: user.fullname,
      email: user.email,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// Submit Complaint
// ---------------------------
app.post("/api/complaints", upload.single("file"), async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;
    if (!name || !email || !category || !subject || !message)
      return res.status(400).json({ error: "All fields are required." });

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const complaintId = await generateSequentialId();

    const complaint = await Complaint.create({
      complaintId,
      name,
      email,
      category,
      subject,
      message,
      filePath,
    });

    // Email to department
    const to = departmentEmails[category] || departmentEmails.Other;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: email,
      to,
      subject: `[Complaint] ${subject}`,
      text: `Complaint ID: ${complaintId}\nName: ${name}\nEmail: ${email}\nCategory: ${category}\nMessage:\n${message}`,
      attachments: filePath ? [{ path: path.join(__dirname, filePath) }] : [],
    });

    // Confirmation to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Complaint Registered Successfully (ID: ${complaintId})`,
      html: `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your complaint has been registered successfully.</p>
        <ul>
          <li><strong>Complaint ID:</strong> ${complaintId}</li>
          <li><strong>Category:</strong> ${category}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Status:</strong> Registered</li>
        </ul>
      `,
    });

    res.json({ message: "Complaint submitted successfully", complaintId });
  } catch (err) {
    console.error("❌ Complaint submission error:", err);
    res.status(500).json({ error: "Failed to submit complaint." });
  }
});

// ---------------------------
// Complaint Retrieval
// ---------------------------
app.get("/api/complaints", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Fetch complaints error:", err);
    res.status(500).json({ error: "Server error while fetching complaints" });
  }
});

app.get("/api/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint)
      return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    console.error("❌ Error fetching complaint:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// Update Complaint Status + Send Feedback Link
// ---------------------------
app.put("/api/complaints/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Registered", "In Progress", "Resolved"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status value" });

    const updated = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Complaint not found" });

    if (status === "Resolved") {
      const reportLink = `http://localhost:5000/api/complaints/${updated.complaintId}/report`;
      const feedbackLink = `http://localhost:5173/feedback/${updated.complaintId}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: updated.email,
        subject: `Complaint ${updated.complaintId} Resolved`,
        html: `
          <p>Hello <strong>${updated.name}</strong>,</p>
          <p>Your complaint has been resolved.</p>
          <p><a href="${reportLink}">📄 Download Report</a></p>
          <p><a href="${feedbackLink}">💬 Give Feedback</a></p>
          <p>Thank you for helping us improve public services!</p>
        `,
      });
    }

    res.json({ message: "Status updated successfully", complaint: updated });
  } catch (err) {
    console.error("❌ Update status error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ---------------------------
// Feedback APIs
// ---------------------------
app.post("/api/feedback", async (req, res) => {
  try {
    const { complaintId, rating, comments } = req.body;
    const feedback = new Feedback({ complaintId, rating, comment: comments });
    await feedback.save();
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("❌ Feedback submission error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/feedbacks", async (req, res) => {
  try {
    // Fetch feedbacks
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

    // Fetch only the fields we need from complaints
    const complaints = await Complaint.find({}, { 
      complaintId: 1, 
      name: 1, 
      email: 1 
    }).lean();

    // Create quick lookup map
    const complaintMap = {};
    complaints.forEach(c => {
      complaintMap[c.complaintId] = c;
    });

    // Attach citizen name + email
    const formatted = feedbacks.map(fb => ({
      _id: fb._id,
      complaintId: fb.complaintId,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.createdAt,
      name: complaintMap[fb.complaintId]?.name || "Unknown User",
      email: complaintMap[fb.complaintId]?.email || "Unavailable"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching feedbacks:", err);
    res.status(500).json({ error: "Error fetching feedbacks" });
  }
});


// PDF Report Generator
// ---------------------------
app.get("/api/complaints/:id/report", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint)
      return res.status(404).json({ error: "Complaint not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=complaint_${complaint.complaintId}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(22).fillColor("#0D47A1").text("Citizen Complaint Report Form`", {
      align: "center",
      underline: true,
    });
    doc.moveDown(1);

    doc
      .fontSize(12)
      .fillColor("#555")
      .text(`Generated On: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown(2);

    doc.fontSize(14).fillColor("#000").text(`Complaint ID: ${complaint.complaintId}`);
    doc.moveDown(1);

    const addSection = (title, fn) => {
      doc.fontSize(15).fillColor("#1565C0").text(title, { underline: true });
      doc.moveDown(0.5);
      fn();
      doc.moveDown(1);
    };

    addSection("Citizen Details", () => {
      doc.text(`Name: ${complaint.name}`).text(`Email: ${complaint.email}`);
    });

    addSection("Complaint Information", () => {
      doc
        .text(`Category: ${complaint.category}`)
        .text(`Subject: ${complaint.subject}`)
        .moveDown(0.3)
        .text("Message:", { underline: true })
        .text(complaint.message || "N/A", { align: "justify", width: 480 });
    });

    addSection("Complaint Status", () => {
      doc
        .text(`Status: ${complaint.status}`)
        .text(`Date Submitted: ${complaint.createdAt.toLocaleString()}`);
    });

    // Determine department name
const resolvedDepartment = complaint.category || "Concerned Department";

doc
  .moveDown(2)
  .fontSize(11)
  .fillColor("#616161")
  .text(
    `This report was generated by the ${resolvedDepartment} Department.`,
    { align: "center" }
  );


    doc.end();
  } catch (err) {
    console.error("❌ Report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// ---------------------------
// Serve Frontend (Production)
// ---------------------------
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "client", "dist");
  app.use(express.static(clientPath));
  app.get("*", (_, res) => res.sendFile(path.join(clientPath, "index.html")));
}

// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
// ---------------------------
// AUTHORITY LOGIN
// ---------------------------
const dummyAuthorities = [
  { email: "water@dept.com", password: "12345", department: "Water Supply" },
  { email: "road@dept.com", password: "12345", department: "Road Maintenance" },
  { email: "transport@dept.com", password: "12345", department: "Public Transport" },
  { email: "sanitation@dept.com", password: "12345", department: "Sanitation" },
  { email: "electricity@dept.com", password: "12345", department: "Electricity" },
  { email: "other@dept.com", password: "12345", department: "Other" },

];

app.post("/api/authority-login", (req, res) => {
  const { email, password } = req.body;
  const authority = dummyAuthorities.find(
    (a) => a.email === email && a.password === password
  );
  if (!authority)
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    message: "Login successful",
    department: authority.department,
    token: "authority-token",
  });
});

// ---------------------------
// GET COMPLAINTS FOR AUTHORITY DEPARTMENT
// ---------------------------
app.get("/api/authority-complaints/:department", async (req, res) => {
  try {
    const { department } = req.params;

    // List of official departments
    const knownDepartments = [
      "Water Supply",
      "Road Maintenance",
      "Public Transport",
      "Sanitation",
      "Electricity"
    ];

    let complaints;

    if (department === "Other") {
      // Show complaints NOT belonging to any known department
      complaints = await Complaint.find({
        category: { $nin: knownDepartments }
      }).sort({ createdAt: -1 });
    } else {
      // Normal filtering for known departments
      complaints = await Complaint.find({ category: department }).sort({ createdAt: -1 });
    }

    res.json(complaints);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching authority complaints" });
  }
});


// ---------------------------
// UPDATE COMPLAINT STATUS (AUTHORITY CONTROL)
// ---------------------------
app.put("/api/authority-complaints/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Complaint.findOneAndUpdate(
      { complaintId: id },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Complaint not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating complaint status" });
  }
});
