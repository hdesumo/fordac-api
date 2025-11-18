const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

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

// SuperAdmin Auth
const superadminAuthRoutes = require("./routes/superadminAuthRoutes");

// Admin Auth
const adminAuthRoutes = require("./routes/adminAuthRoutes");

// Member Auth
const memberAuthRoutes = require("./routes/memberAuthRoutes");

// Contacts
const contactRoutes = require("./routes/contactRoutes");

// Departments
const departmentRoutes = require("./routes/departmentRoutes");

// Events
const eventRoutes = require("./routes/eventRoutes");

// Notifications
const notificationsRoutes = require("./routes/memberNotificationsRoutes");



/* ============================
   ROUTES USE
============================ */

// SuperAdmin
app.use("/api/superadmin", superadminAuthRoutes);

// Admin
app.use("/api/admin", adminAuthRoutes);

// Members
app.use("/api/members", memberAuthRoutes);   // ✔️ UN SEUL POINT D’ENTRÉE

// Contacts
app.use("/api/contacts", contactRoutes);

// Departments
app.use("/api/departments", departmentRoutes);

// Events
app.use("/api/events", eventRoutes);

// Notifications
app.use("/api/notifications", notificationsRoutes);



/* ============================
   SERVER LISTEN
============================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
