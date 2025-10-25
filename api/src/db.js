// src/db.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Pool } = pkg;

// Chargement garanti du .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;

// Vérification immédiate
console.log("🔍 Variables DB chargées :");
console.log("DB_HOST:", DB_HOST);
console.log("DB_PORT:", DB_PORT);
console.log("DB_USER:", DB_USER);
console.log("DB_PASS:", DB_PASS ? "(ok)" : "(vide)");
console.log("DB_NAME:", DB_NAME);

// Protection : arrêt si variable manquante
if (!DB_USER || !DB_PASS || !DB_HOST || !DB_PORT || !DB_NAME) {
  console.error("❌ Erreur : une ou plusieurs variables d'environnement sont manquantes.");
  process.exit(1);
}

// Construction de l’URL avec encodage du mot de passe
const connectionString = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log("🧩 Connexion PostgreSQL :", connectionString.replace(DB_PASS, "****"));

const pool = new Pool({
  connectionString,
  ssl: false, // ton cluster Railway n'accepte pas SSL
});

// Test immédiat
pool
  .connect()
  .then((client) => {
    console.log("🗄️  Connexion PostgreSQL réussie !");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à PostgreSQL :", err.message);
  });

export default pool;
