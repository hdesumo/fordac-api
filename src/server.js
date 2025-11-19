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
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const superadminAuthRoutes = require("./routes/superadminAuthRoutes");
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminMiddleware = require("./middleware/adminMiddleware");

/* ============================
   ROUTES USE
============================ */
app.use("/api/admin", adminAuthRoutes);
app.use("/api/superadmin", superadminAuthRoutes);
app.use("/api/members", memberAuthRoutes);
app.use("/api/admin/dashboard", adminMiddleware, adminDashboardRoutes);

/* ============================
   SERVER LISTEN
============================ */
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
