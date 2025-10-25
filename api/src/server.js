import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Correction du chemin du .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") }); // 👈 chemin absolu du .env

import pool from "./db.js";

const app = express();

console.log("✅ Chargement .env réussi — DB_PASS =", process.env.DB_PASS ? "**** (masqué)" : "❌ non chargé");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 FORDAC Connect API v1.0.0 - Forces Démocratiques pour l’Action et le Changement (FORDAC)");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log("🚀 FORDAC Connect API v1.0.0");
  console.log("🏛️  Forces Démocratiques pour l’Action et le Changement (FORDAC)");
  console.log(`✅ Server running on port ${PORT}`);

  try {
    const client = await pool.connect();
    console.log("🗄️  Database connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});
