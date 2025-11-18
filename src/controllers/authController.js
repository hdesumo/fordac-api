const pool = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ============================================================
   📌 CONNEXION MEMBRE
   ============================================================ */
exports.loginMember = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email et mot de passe requis."
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Identifiants incorrects."
      });
    }

    const member = result.rows[0];

    if (member.status !== "approved") {
      return res.status(403).json({
        error: "Votre adhésion est encore en attente de validation."
      });
    }

    const isMatch = await bcrypt.compare(password, member.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Identifiants incorrects."
      });
    }

    const token = jwt.sign(
      { id: member.id, role: "member", email: member.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie.",
      token,
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        departement: member.departement,
        secteur: member.secteur,
        arrondissement: member.arrondissement,
      },
    });

  } catch (error) {
    console.error("❌ Erreur login membre :", error.message);
    res.status(500).json({ error: "Erreur interne lors de la connexion." });
  }
};

/* ============================================================
   📌 VÉRIFICATION DU TOKEN
   ============================================================ */
exports.verifyTokenController = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token manquant." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true,
      user: decoded,
    });
  } catch (error) {
    return res.status(401).json({ valid: false, error: "Token invalide." });
  }
};
