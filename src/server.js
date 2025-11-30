// src/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("📡 ENV LOADED:", process.env.DB_HOST, process.env.DB_NAME);

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
const authAdminRoutes = require("./routes/authAdminRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminMiddleware = require("./middleware/adminMiddleware");

/* ============================
   ROUTES USE
============================ */
app.use("/api/admin/auth", require("./routes/authAdminRoutes"));
app.use("/api/superadmin", superadminRoutes);
app.use("/api/members", memberAuthRoutes);
app.use("/api/admin/dashboard", adminMiddleware, adminDashboardRoutes);
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));

/* ============================
   SERVER LISTEN
============================ */
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
