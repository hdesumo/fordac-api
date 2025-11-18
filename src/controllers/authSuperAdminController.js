const db = require('../config/db');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

exports.superadminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });
    }

    // Vérifier si email existe
    const result = await db.query(
      'SELECT * FROM superadmin WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const superadmin = result.rows[0];

    // Vérifier mot de passe
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer token
    const token = jwt.sign(
      { id: superadmin.id, role: 'superadmin', email: superadmin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
