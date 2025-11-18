require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const contactRoutes = require("./routes/contactRoutes");
const forumRoutes = require("./routes/forumRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const commentRoutes = require("./routes/commentRoutes");
const memberNotificationRoutes = require("./routes/memberNotificationsRoutes");

const app = express();

/* -------------------------------------------------
   🔧 Middlewares
---------------------------------------------------*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------
   🔐 CORS — AUTHORISED DOMAINS
---------------------------------------------------*/
const allowedOrigins = [
  "http://localhost:3000",
  "https://fordac-connect.vercel.app",
  "https://www.fordac-connect.vercel.app",
  "https://fordac-connect.org",
  "https://www.fordac-connect.org",
];

function isVercelPreview(origin) {
  return origin && origin.endsWith(".vercel.app");
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || isVercelPreview(origin)) {
      return callback(null, true);
    }

    console.warn("❌ CORS refusé pour :", origin);
    callback(new Error("Origine non autorisée par CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

/* -------------------------------------------------
   📁 STATIC — UPLOADS
---------------------------------------------------*/
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../upload-service/uploads"))
);

/* -------------------------------------------------
   🛣 ROUTES — ORDONNÉES ET CORRIGÉES
---------------------------------------------------*/

// AUTH
app.use("/api/auth/admin", require("./routes/adminAuthRoutes"));
app.use("/api/superadmin/auth", require("./routes/superadminAuthRoutes"));
app.use("/api/members/auth", require("./routes/memberAuthRoutes"));

// MEMBERS
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/members/notifications", memberNotificationRoutes);

// ADMIN
app.use("/api/admin/stats", require("./routes/adminStatsRoutes"));
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));
app.use("/api/admin/membres", require("./routes/adminMembresRoutes"));

// SUPERADMIN
app.use("/api/superadmin/dashboard", require("./routes/superadminDashboardRoutes"));
app.use("/api/superadmin/admins", require("./routes/superadminAdminRoutes"));
app.use("/api/superadmin/members/export", require("./routes/superadminMemberExportRoutes"));
app.use("/api/superadmin/members/stats", require("./routes/superadminMemberStatsRoutes"));
app.use("/api/superadmin/activities", require("./routes/superadminActivitiesRoutes"));

// FORUM / PUBLICATIONS
app.use("/api/forum", forumRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/comments", commentRoutes);

// CONTACT
app.use("/api/contact", contactRoutes);

/* -------------------------------------------------
   🧪 TEST ROUTE
---------------------------------------------------*/
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    app: "FORDAC CONNECT API",
    version: "1.0.0",
    database: "PostgreSQL",
    domain: process.env.API_BASE_URL || "not-set",
  });
});

/* -------------------------------------------------
   🚀 LAUNCH SERVER
---------------------------------------------------*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 FORDAC API démarrée sur le port ${PORT}`)
);
