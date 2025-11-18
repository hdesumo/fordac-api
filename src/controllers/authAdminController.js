const db = require("../db"); // ✅ IMPORT OBLIGATOIRE

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si admin existe
    const sql = "SELECT * FROM admins WHERE email = $1 LIMIT 1";
    const result = await db.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Admin introuvable" });
    }

    const admin = result.rows[0];

    if (admin.password !== password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    res.json({
      message: "Connexion réussie",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error("Erreur login admin:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
