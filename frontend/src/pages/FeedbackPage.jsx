import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Feedback = () => {
  const { complaintId } = useParams();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert("Please select a rating before submitting.");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/feedback", {
        complaintId,
        rating,
        comments,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.thankTitle}>🎉 Thank You!</h2>
          <p style={styles.text}>
            Your feedback for complaint <strong>#{complaintId}</strong> has been submitted successfully.
          </p>
          <p style={styles.text}>We appreciate your time and support!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Feedback for Complaint #{complaintId}</h2>
        <p style={styles.subtitle}>
          Please rate your experience and share your feedback.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                style={{
                  ...styles.star,
                  color: num <= rating ? "#7B3FE4" : "#ccc",
                }}
                onClick={() => setRating(num)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your feedback here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={styles.textarea}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------
// 🎨 Inline Styles
// -------------------------
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #7B3FE4, #B084F6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    padding: "40px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#4B0082",
    marginBottom: "10px",
    fontWeight: "600",
  },
  subtitle: {
    color: "#666",
    fontSize: "15px",
    marginBottom: "25px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ratingContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  star: {
    fontSize: "30px",
    margin: "0 5px",
    cursor: "pointer",
    transition: "color 0.3s",
  },
  textarea: {
    width: "100%",
    height: "100px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    padding: "10px 14px",
    fontSize: "15px",
    resize: "none",
    marginBottom: "20px",
    outline: "none",
  },
  button: {
    backgroundColor: "#7B3FE4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  thankTitle: {
    color: "#4B0082",
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "15px",
  },
  text: {
    color: "#555",
    fontSize: "16px",
    lineHeight: "1.6",
  },
};

export default Feedback;
