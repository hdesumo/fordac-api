require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const contactRoutes = require("./routes/contactRoutes");
const adminMessagesRoutes = require("./routes/admin/messages");
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

// ⭐ Autorise aussi toutes les URL de previews Vercel
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
   🛣 ROUTES — CORRIGÉES
---------------------------------------------------*/
app.use("/auth", require("./routes/authRoutes"));
app.use("/forum", require("./routes/forumRoutes"));
app.use("/members", require("./routes/memberRoutes"));
app.use("/upload", require("../upload-service/src/routes/uploadRoutes"));
app.use("/contact", contactRoutes);
app.use("/api/auth/admin", require("./routes/adminAuthRoutes"));
app.use("/api/admin/messages", adminMessagesRoutes);
app.use('/api/admin', require('./routes/adminAuthRoutes'));
app.use("/api/superadmin/stats", require("./routes/superadminStatsRoutes"));
app.use("/api/admin/stats", require("./routes/adminStatsRoutes"));
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));
app.use("/api/admin/members", require("./routes/adminMembersRoutes"));
app.use("/api/superadmin/dashboard", require("./routes/superadminDashboardRoutes"));
app.use("/api/admin/membres", require("./routes/adminMembresRoutes"));
app.use("/api/admin/membres", require("./routes/adminMembresRoutes"));
app.use("/api/admin/membres", require("./routes/adminMembresRoutes"));
app.use("/api/superadmin/admins", require("./routes/superadminAdminRoutes"));
app.use("/api/superadmin/members/export", require("./routes/superadminMemberExportRoutes"));
app.use("/api/superadmin/members/stats", require("./routes/superadminMemberStatsRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/forum", forumRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/members/notifications", memberNotificationRoutes);

/* -------------------------------------------------
   🧪 TEST ROUTE — pour monitoring
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
