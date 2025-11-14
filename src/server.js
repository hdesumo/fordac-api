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
   🧩 CONFIGURATION CORS SÉCURISÉE
   ================================ */
const allowedOrigins = [
  "http://localhost:3000",              // Dev local Next.js
  "https://fordac-connect.vercel.app",  // Domaine Vercel
  "https://fordac-connect.org",         // Domaine personnalisé
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Origine non autorisée par CORS :", origin);
      callback(new Error("CORS non autorisé pour cette origine."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

/* ================================
   🧠 CONNEXION À LA BASE DE DONNÉES
   ================================ */
pool
  .connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));

/* ================================
   🛣️ ROUTES PRINCIPALES
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
   🚀 LANCEMENT DU SERVEUR
   ================================ */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log("✅ API FORDAC Connect opérationnelle");
  console.log("🌐 Origines autorisées :", allowedOrigins.join(", "));
});
