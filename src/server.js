import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

// 🔐 Import des middlewares et routes
import memberRoutes from "./routes/memberRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// Si tu as un module upload :
import uploadRoutes from "./routes/uploadRoutes.js";

// Charger les variables d’environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔍 Diagnostic des variables DB
console.log("🔍 Variables DB chargées :");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "(ok)" : "(absent)");
console.log("DB_NAME:", process.env.DB_NAME);

// ================================
// 🧠 Connexion PostgreSQL
// ================================
async function testDBConnection() {
  try {
    const client = await pool.connect();
    console.log("🗄️  Database connected successfully!");
    await client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}
testDBConnection();

// ================================
// 📡 Routes principales
// ================================
app.get("/", (req, res) => {
  res.send({
    message: "Bienvenue sur l’API FORDAC Connect",
    version: "1.0.0",
    author: "Apps 1 Global",
  });
});

// 👥 Membres
app.use("/api/members", memberRoutes);

// 🧑‍💼 Admins
app.use("/api/admins", adminRoutes);

// 📤 Uploads (si activé)
app.use("/api/uploads", uploadRoutes);

// ================================
// 🚀 Démarrage du serveur
// ================================
app.use("/uploads", express.static("uploads"));
app.listen(PORT, () => {
  console.log(`🚀 FORDAC Connect API v1.0.0`);
  console.log(`🏛️  Forces Démocratiques pour l’Action et le Changement (FORDAC)`);
  console.log(`✅ Server running on port ${PORT}`);
});