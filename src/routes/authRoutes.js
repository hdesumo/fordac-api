const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // pool PostgreSQL
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN ADMIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM admins WHERE email = $1 LIMIT 1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Erreur login admin :", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// EXPORT COMMONJS
module.exports = router;
