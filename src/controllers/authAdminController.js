exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await db.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (admin.rows.length === 0) {
      return res.status(404).json({ message: "Admin non trouvé" });
    }

    const user = admin.rows[0];

    if (user.password !== password) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    return res.json({ message: "Connexion réussie", admin: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
