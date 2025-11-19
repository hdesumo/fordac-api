// src/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "FORDAC API is running",
    version: "1.0.0"
  });
});

/* ============================
   ROUTES IMPORT
============================ */

// Admin Auth Routes
const adminAuthRoutes = require("./routes/adminAuthRoutes");

// SuperAdmin Auth (si nécessaire)
const superadminAuthRoutes = require("./routes/superadminAuthRoutes");

// Members Auth (si nécessaire)
const memberAuthRoutes = require("./routes/memberAuthRoutes");

// Admin Dashboard Routes
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const adminMiddleware = require("./middleware/adminMiddleware");



/* ============================
   ROUTES USE
============================ */

// Admin
app.use("/api/admin", adminAuthRoutes);

// SuperAdmin
app.use("/api/superadmin", superadminAuthRoutes);

// Members
app.use("/api/members", memberAuthRoutes);

// Dashboard admin
app.use("/api/admin/dashboard", adminMiddleware, adminDashboardRoutes);


/* ============================
   SERVER LISTEN
============================ */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
