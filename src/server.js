require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();

/* -----------------------------------------------------
   🔧 MIDDLEWARES GLOBAUX
----------------------------------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* -----------------------------------------------------
   🔒 MIDDLEWARES IMPORT
----------------------------------------------------- */
const memberMiddleware = require("./middleware/memberMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const superadminMiddleware = require("./middleware/superadminMiddleware");

/* -----------------------------------------------------
   🧭 ROUTES IMPORT
   (Respect EXACT de TON ARBORESCENCE)
----------------------------------------------------- */

/* AUTH */
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const superAdminAuthRoutes = require("./routes/superAdminAuthRoutes");

/* FORUM */
const forumRoutes = require("./routes/forumRoutes");
const adminForumRoutes = require("./routes/adminForumRoutes");

/* FONCTIONNALITÉS MEMBRES */
const memberRoutes = require("./routes/memberRoutes");
const memberNotificationRoutes = require("./routes/memberNotificationRoutes");

/* ADMIN */
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const adminActivityRoutes = require("./routes/adminActivityRoutes");

/* SUPERADMIN (PRÉSIDENT) */
const superadminAdminRoutes = require("./routes/superadminAdminRoutes");
const superadminMemberRoutes = require("./routes/superadminMemberRoutes");
const superadminStatsRoutes = require("./routes/superadminStatsRoutes");
const superadminExportRoutes = require("./routes/superadminExportRoutes");
const superadminDashboardRoutes = require("./routes/superadminDashboardRoutes");
const superadminNotificationRoutes = require("./routes/superadminNotificationRoutes");

/* AUTRES MODULES */
const adhesionRoutes = require("./routes/adhesionRoutes");
const eventRoutes = require("./routes/eventRoutes");
const contactRoutes = require("./routes/contactRoutes");
const organesRoutes = require("./routes/organesRoutes");

/* -----------------------------------------------------
   🌐 ROUTES PUBLIQUES
----------------------------------------------------- */
app.use("/api/auth/members", memberAuthRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/auth/president", superAdminAuthRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/organes", organesRoutes);

/* -----------------------------------------------------
   🔒 ROUTES MEMBRES
----------------------------------------------------- */
app.use("/api/members", memberMiddleware, memberRoutes);
app.use("/api/members/notifications", memberMiddleware, memberNotificationRoutes);

/* FORUM — Accès membres */
app.use("/api/forum", memberMiddleware, forumRoutes);

/* ADHÉSION — Réservée aux membres connectés (pour mise à jour) */
app.use("/api/adhesion", memberMiddleware, adhesionRoutes);

/* -----------------------------------------------------
   🔒 ROUTES ADMIN
----------------------------------------------------- */
app.use("/api/admin/forum", adminMiddleware, adminForumRoutes);
app.use("/api/admin/notifications", adminMiddleware, adminNotificationRoutes);
app.use("/api/admin/activity", adminMiddleware, adminActivityRoutes);

/* -----------------------------------------------------
   🔒 ROUTES SUPERADMIN (PRÉSIDENT)
----------------------------------------------------- */
app.use("/api/president/admins", superadminMiddleware, superadminAdminRoutes);
app.use("/api/president/members", superadminMiddleware, superadminMemberRoutes);
app.use("/api/president/stats", superadminMiddleware, superadminStatsRoutes);
app.use("/api/president/export", superadminMiddleware, superadminExportRoutes);
app.use("/api/president/dashboard", superadminMiddleware, superadminDashboardRoutes);
app.use("/api/president/notifications", superadminMiddleware, superadminNotificationRoutes);

/* -----------------------------------------------------
   🧪 HEALTH CHECK (Railway)
----------------------------------------------------- */
app.get("/api/health", async (req, res) => {
  try {
    const db = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      db_time: db.rows[0].now,
    });
  } catch (e) {
    res.status(500).json({
      status: "db_error",
      error: e.message,
    });
  }
});

/* -----------------------------------------------------
   ❌ 404
----------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

/* -----------------------------------------------------
   💥 ERROR HANDLER
----------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Erreur interne :", err);
  res.status(500).json({
    message: "Erreur interne du serveur",
    error: err.message,
  });
});

/* -----------------------------------------------------
   🚀 START SERVER
----------------------------------------------------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 FORDAC API lancé sur le port ${PORT}`);
});
