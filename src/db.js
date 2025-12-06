// Charge automatiquement les variables d'environnement depuis .env
require("dotenv").config();
const { Pool } = require("pg");

// Vérification stricte des variables d’environnement
["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Variable d'environnement manquante : ${key}`);
  }
});

// Configuration du Pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Requis pour Railway
  },
});

// Message de test de connexion
pool
  .connect()
  .then((client) => {
    console.log("📌 PostgreSQL connecté avec succès (Pool OK)");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Impossible de se connecter à PostgreSQL :", err);
  });

module.exports = pool;
