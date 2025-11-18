const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si le superadmin existe
    const result = await db.query(
      "SELECT * FROM superadmins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin non trouvé" });
    }

    const user = result.rows[0];

    // 🔥 Vérification avec bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Génération du token
    const token = jwt.sign(
      { id: user.id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Réponse OK
    res.json({
      message: "Connexion réussie",
      token,
      superadmin: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("SuperAdmin Login Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
