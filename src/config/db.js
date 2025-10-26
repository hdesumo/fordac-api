import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
const { Pool } = pg;

// ✅ Connexion PostgreSQL sans SSL, 100 % via .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASS), // 🔒 Conversion forcée en texte
  database: process.env.DB_NAME,
  ssl: false,
});

pool
  .connect()
  .then(() => console.log("✅ Connecté à PostgreSQL (sans SSL)"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));

export default pool;
