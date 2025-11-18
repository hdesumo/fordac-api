const pool = require("../db.js");
const bcrypt = require("bcryptjs");

exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'superadmin'",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "SuperAdmin introuvable" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    res.json({
      success: true,
      message: "Connexion réussie",
      token: jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      ),
      superadmin: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Erreur superAdminLogin :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updateSuperAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const superAdminEmail = "superadmin@fordac-connect.org";

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'superadmin'",
      [superAdminEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "SuperAdmin introuvable" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, superAdminEmail]
    );

    res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur de mise à jour du mot de passe :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
