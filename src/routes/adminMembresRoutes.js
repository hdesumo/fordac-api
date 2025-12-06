// ================================================
// ROUTES ADMIN — GESTION DES MEMBRES
// ================================================
const express = require("express");
const router = express.Router();

const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");
const bcrypt = require("bcryptjs");
const { sendActivationEmail } = require("../services/emailService");

// =======================================================
// 1. LISTE DES MEMBRES
// =======================================================
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM members ORDER BY id DESC");
    return res.json(result.rows);
  } catch (err) {
    console.error("Erreur liste membres:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
// 2. AFFICHER UN MEMBRE
// =======================================================
router.get("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM members WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Membre introuvable." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur afficher membre:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
// 3. MODIFIER UN MEMBRE
// =======================================================
router.put("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;

  try {
    await db.query(
      `UPDATE members 
       SET name=$1, phone=$2, email=$3, updated_at=NOW()
       WHERE id=$4`,
      [name, phone, email, id]
    );

    return res.json({ message: "Membre mis à jour." });

  } catch (err) {
    console.error("Erreur mise à jour membre:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
// 4. SUPPRIMER UN MEMBRE
// =======================================================
router.delete("/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM members WHERE id=$1", [id]);
    return res.json({ message: "Membre supprimé." });
  } catch (err) {
    console.error("Erreur suppression membre:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =======================================================
// 5. ACTIVATION D’UN MEMBRE (pending → active)
//    → Génère PIN = 4 derniers chiffres du téléphone
//    → Hash PIN
//    → Envoie email
//    → Met à jour statut
// =======================================================
router.post("/activate/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Récupérer le membre
    const result = await db.query(
      "SELECT phone, email, status FROM members WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Membre introuvable." });
    }

    const membre = result.rows[0];

    if (membre.status === "active") {
      return res.json({ message: "Membre déjà actif." });
    }

    // PIN = 4 derniers chiffres
    const rawPin = membre.phone.slice(-4);

    // Hash du PIN
    const hashedPin = await bcrypt.hash(rawPin, 10);

    // Activation + PIN
    await db.query(
      `UPDATE members 
       SET status='active', pin=$1, updated_at=NOW(), is_first_login=true 
       WHERE id=$2`,
      [hashedPin, id]
    );

    // Email d’activation
    await sendActivationEmail(membre.email, rawPin);

    return res.json({
      success: true,
      message: "Membre activé avec succès.",
      pin: rawPin
    });

  } catch (err) {
    console.error("Erreur activation membre:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
