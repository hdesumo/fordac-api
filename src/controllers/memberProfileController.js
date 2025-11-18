// controllers/memberProfileController.js
const db = require("../db");

exports.getProfile = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM members WHERE id=$1", [
      req.member.id,
    ]);

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getProfile:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, quartier, secteur, arrondissement } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE members
      SET name=$1, email=$2, phone=$3, quartier=$4, secteur=$5, arrondissement=$6
      WHERE id=$7
      RETURNING *
      `,
      [name, email, phone, quartier, secteur, arrondissement, req.member.id]
    );

    return res.json({
      message: "Profil mis à jour avec succès",
      member: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur updateProfile:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
