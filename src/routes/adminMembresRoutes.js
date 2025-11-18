const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

// =======================================================
//  GET TOUS LES MEMBRES
// =======================================================
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, email, phone, secteur, arrondissement, quartier, status, created_at
      FROM users
      ORDER BY id DESC
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET membres:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
//  GET UN MEMBRE PAR ID
// =======================================================
router.get("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT id, name, email, phone, secteur, arrondissement, quartier, status, created_at
      FROM users
      WHERE id=$1
    `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Membre introuvable" });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur GET membre:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
//  MISE À JOUR D’UN MEMBRE
// =======================================================
router.put("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  const {
    name,
    email,
    phone,
    secteur,
    arrondissement,
    quartier,
    status,
  } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE users
      SET 
        name=$1,
        email=$2,
        phone=$3,
        secteur=$4,
        arrondissement=$5,
        quartier=$6,
        status=$7
      WHERE id=$8
      RETURNING *
    `,
      [
        name,
        email,
        phone,
        secteur || null,
        arrondissement || null,
        quartier || null,
        status,
        id,
      ]
    );

    return res.json({
      message: "Membre mis à jour avec succès",
      membre: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur MAJ membre:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
//  SUPPRESSION D’UN MEMBRE
// =======================================================
router.delete("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM users WHERE id=$1", [id]);

    return res.json({
      message: "Membre supprimé avec succès",
    });
  } catch (err) {
    console.error("Erreur suppression membre:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
