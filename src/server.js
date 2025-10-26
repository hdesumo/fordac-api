import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import pool from "./config/db.js";

import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"; // ✅ Import au lieu de require

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test connexion PostgreSQL
pool
  .connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));

// === ROUTES ===
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC Connect",
    version: "1.0.0",
    author: "Apps 1 Global",
  });
});

app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes); // ✅ route événements

// === DÉMARRAGE SERVEUR ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
