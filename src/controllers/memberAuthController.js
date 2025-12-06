const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// =========================
// Connexion : phone + PIN
// =========================
exports.memberLogin = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: "Téléphone et PIN requis." });
    }

    const result = await pool.query(
      "SELECT * FROM members WHERE phone = $1 LIMIT 1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre introuvable." });
    }

    const member = result.rows[0];

    if (member.status !== "active") {
      return res.status(403).json({ error: "Compte non actif." });
    }

    const isMatch = await bcrypt.compare(pin, member.pin);
    if (!isMatch) {
      return res.status(400).json({ error: "PIN incorrect." });
    }

    const token = jwt.sign(
      { id: member.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(
      "UPDATE members SET last_login = NOW(), is_first_login = false WHERE id=$1",
      [member.id]
    );

    return res.json({
      success: true,
      token,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        is_first_login: member.is_first_login
      }
    });

  } catch (err) {
    console.error("Erreur login membre:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// =========================
// Récupération profil
// =========================
exports.memberProfile = async (req, res) => {
  try {
    const memberId = req.member.id;

    const result = await pool.query(
      "SELECT id, name, phone, email, status FROM members WHERE id=$1",
      [memberId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Erreur profil:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// =========================
// Changement du PIN
// =========================
exports.changePin = async (req, res) => {
  try {
    const memberId = req.member.id;
    const { oldPin, newPin } = req.body;

    if (!oldPin || !newPin) {
      return res.status(400).json({ error: "Ancien et nouveau PIN requis." });
    }

    const result = await pool.query(
      "SELECT pin FROM members WHERE id=$1",
      [memberId]
    );

    const member = result.rows[0];

    const isMatch = await bcrypt.compare(oldPin, member.pin);
    if (!isMatch) {
      return res.status(400).json({ error: "Ancien PIN incorrect." });
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);

    await pool.query(
      "UPDATE members SET pin=$1 WHERE id=$2",
      [hashedNewPin, memberId]
    );

    return res.json({ success: true, message: "PIN mis à jour." });

  } catch (err) {
    console.error("Erreur changePin:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
