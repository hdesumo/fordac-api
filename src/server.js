require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Connexion PostgreSQL (ton fichier actuel dans src/db.js)
const pool = require("./db");

// Routes membres
const memberRoutes = require("./routes/memberRoutes");

// =======================================================
// INITIALISATION
// =======================================================
const app = express();

// =======================================================
// MIDDLEWARES
// =======================================================

// Lire JSON dans les requêtes
app.use(express.json());

// CORS autorisé pour ton frontend FORDAC
app.use(
  cors({
    origin: [
      "http://localhost:3000",            // Local dev
      "https://www.fordac-connect.org",   // Vitrine prod
      "https://fordac-connect.org",       // Sans www
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Log des requêtes (dev uniquement)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`);
    next();
  });
}

// =======================================================
// ROUTES API
// =======================================================
app.use("/api/members", memberRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "FORDAC API is running…" });
});

// =======================================================
// 404 → Route non trouvée
// =======================================================
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

// =======================================================
// DÉMARRAGE SERVEUR
// =======================================================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("======================================");
  console.log("🚀 FORDAC CONNECT API démarré");
  console.log(`🌍 Port : ${PORT}`);
  console.log("======================================");
});
