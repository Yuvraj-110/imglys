// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const protect = require("./middleware/authMiddleware");
const profileRoutes = require("./routes/profileRoute");
const paymentConfirmRoute = require('./routes/paymentConfirm');
const collectionRoutes = require('./routes/collectionRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');


// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ----------- Body parser -----------
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ----------- CORS Middleware -----------
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ----------- API Routes -----------
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/admin', require('./routes/adminRoute'));
app.use("/api/payment", require("./routes/payment"));
app.use('/api/payment', paymentConfirmRoute);
app.use('/api/collections', collectionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// ----------- Serve Frontend Static Files -----------
const frontendPath = path.join(__dirname, "../");
app.use(express.static(frontendPath));

// ----------- Serve Landing Page on Root URL -----------
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "landing.html"));
});

// ----------- Protected Route Test -----------
app.get("/api/protected", protect, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});

// ----------- Start Server -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
