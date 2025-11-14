import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./config/db.js";

import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adhesionRoutes from "./routes/adhesionRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

/* ================================
   🧩 CORS
   ================================ */
const allowedOrigins = [
  "http://localhost:3000",
  "https://fordac-connect.vercel.app",
  "https://fordac-connect.org",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS refusé pour :", origin);
      callback(new Error("Origine CORS interdite"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

/* ================================
   🧠 PostgreSQL
   ================================ */
pool
  .connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));

/* ================================
   🛣️ ROUTES
   ================================ */
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC Connect",
    version: "1.0.0",
    author: "Apps 1 Global",
  });
});

app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/adhesion", adhesionRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/auth", authRoutes);

/* ================================
   🚀 LANCEMENT
   ================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log("🌐 Origines autorisées :", allowedOrigins.join(", "));
  console.log("✅ API FORDAC Connect opérationnelle");
});
