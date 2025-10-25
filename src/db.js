// src/db.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Pool } = pkg;

// ensure .env loaded (in case direct import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;

if (!DB_USER || !DB_PASS || !DB_HOST || !DB_NAME) {
  console.error("❌ Variables DB manquantes:", { DB_USER, DB_PASS: DB_PASS? "(ok)" : "(vide)", DB_HOST, DB_PORT, DB_NAME });
  process.exit(1);
}

const connectionString = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log("🧩 Connexion PostgreSQL :", connectionString.replace(DB_PASS, "****"));

const pool = new Pool({
  connectionString,
  ssl: false
});

export default pool;
