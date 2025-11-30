const { Pool } = require("pg");

// Vérification stricte des variables d’environnement
["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Variable d'environnement manquante : ${key}`);
  }
});

// Railway utilise un certificat SSL auto signé
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: 10,                      // Maximum connections
  idleTimeoutMillis: 30000,     // Auto-reconnexion
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test initial
pool
  .connect()
  .then((client) => {
    console.log("📌 PostgreSQL connecté avec succès (Pool OK)");
    client.release();
  })
  .catch((err) =>
    console.error("❌ Impossible de se connecter à PostgreSQL :", err)
  );

// Auto-reconnexion en cas de perte de lien Railway
pool.on("error", (err) => {
  console.error("⚠️  PostgreSQL pool error :", err);
  console.log("🔄 Tentative de récupération...");
});

module.exports = pool;
