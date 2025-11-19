// src/controllers/authAdminController.js
console.log("⚡ authAdminController.js LOADED");

const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("\n🔎 Reçu du frontend →", { email, password });

    // Vérifier si l'admin existe
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1 LIMIT 1",
      [email]
    );

    console.log("📌 Nombre de résultats:", result.rows.length);

    if (result.rows.length === 0) {
      console.log("❌ Admin non trouvé");
      return res.status(404).json({ error: "Admin non trouvé." });
    }

    const admin = result.rows[0];

    // --- DIAGNOSTIC CRITIQUE : AFFICHER LE MDP STOCKÉ DANS LA BASE ---
    console.log("🔐 Mot de passe récupéré depuis la DB:", admin.password);
    console.log("🔐 Longueur du hash:", admin.password?.length);
    console.log("🔐 Type:", typeof admin.password);

    // Vérification du mot de passe (bcrypt)
    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("🔍 bcrypt.compare() =", isMatch);

    if (!isMatch) {
      console.log("❌ Mot de passe incorrect.");
      return res.status(400).json({ error: "Mot de passe incorrect." });
    }

    // Génération du token
    const token = jwt.sign(
      { id: admin.id, role: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Connexion réussie pour:", admin.email);

    // Réponse
    return res.json({
      message: "Connexion réussie.",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        service: admin.service,
        role: "admin",
      },
    });

  } catch (error) {
    console.error("❌ Admin Login Error:", error);
    return res.status(500).json({ error: "Erreur interne serveur." });
  }
};
