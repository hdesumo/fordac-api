const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
//  REGISTER
// =========================
exports.registerMember = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const [existing] = await db.query(
      "SELECT id FROM members WHERE email = $1 OR phone = $2 LIMIT 1",
      [email, phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email ou numéro déjà utilisé." });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO members (name, email, phone, password) 
       VALUES ($1, $2, $3, $4)`,
      [name, email, phone, hashed]
    );

    return res.status(201).json({ message: "Inscription réussie." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// =========================
//  LOGIN
// =========================
exports.loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM members WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email incorrect." });
    }

    const member = rows[0];

    const match = await bcrypt.compare(password, member.password);
    if (!match) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: member.id, email: member.email, role: "member" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Connexion réussie",
      token,
      member,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// =========================
//  GET PROFILE
// =========================
exports.getMemberProfile = async (req, res) => {
  try {
    const memberId = req.user.id; // Doit venir du middleware auth

    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM members WHERE id = $1 LIMIT 1",
      [memberId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
