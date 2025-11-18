const express = require("express");
const router = express.Router();
const db = require("../../db"); // adapte si ton chemin diffère
const verifyAdminToken = require("../../middlewares/verifyAdminToken");

/**
 * ============================================
 * 1. ENVOI GLOBAL
 * POST /api/admin/messages/broadcast
 * ============================================
 */
router.post("/broadcast", verifyAdminToken, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content)
    return res
      .status(400)
      .json({ message: "Veuillez renseigner le titre et le contenu." });

  try {
    const msg = await db.query(
      `INSERT INTO admin_messages (title, content, target_type)
       VALUES ($1,$2,'global')
       RETURNING *`,
      [title, content]
    );

    return res.json({ success: true, message: msg.rows[0] });
  } catch (e) {
    console.error("Erreur envoi global:", e);
    return res.status(500).json({ message: "Erreur interne serveur." });
  }
});

/**
 * ============================================
 * 2. ENVOI CIBLÉ
 * POST /api/admin/messages/targeted
 * ============================================
 */
router.post("/targeted", verifyAdminToken, async (req, res) => {
  const { title, content, departement, secteur, arrondissement, quartier } =
    req.body;

  if (!title || !content)
    return res
      .status(400)
      .json({ message: "Veuillez renseigner le titre et le contenu." });

  const filter = [];
  const values = [];

  if (departement) {
    filter.push(`departement = $${values.length + 1}`);
    values.push(departement);
  }
  if (secteur) {
    filter.push(`secteur = $${values.length + 1}`);
    values.push(secteur);
  }
  if (arrondissement) {
    filter.push(`arrondissement = $${values.length + 1}`);
    values.push(arrondissement);
  }
  if (quartier) {
    filter.push(`quartier = $${values.length + 1}`);
    values.push(quartier);
  }

  const whereClause = filter.length ? "WHERE " + filter.join(" AND ") : "";

  try {
    // 1. Stockage du message
    const msg = await db.query(
      `INSERT INTO admin_messages (title, content, target_type, target_value)
       VALUES ($1,$2,'targeted',$3)
       RETURNING *`,
      [
        title,
        content,
        JSON.stringify({ departement, secteur, arrondissement, quartier }),
      ]
    );

    // 2. Extraction des membres ciblés
    const targets = await db.query(
      `SELECT id FROM members ${whereClause}`,
      values
    );

    // 3. Enregistrement des destinataires
    for (let t of targets.rows) {
      await db.query(
        `INSERT INTO admin_message_targets (message_id, member_id)
         VALUES ($1,$2)`,
        [msg.rows[0].id, t.id]
      );
    }

    return res.json({
      success: true,
      message: msg.rows[0],
      count: targets.rows.length,
    });
  } catch (e) {
    console.error("Erreur ciblée:", e);
    return res.status(500).json({ message: "Erreur interne serveur." });
  }
});

/**
 * ============================================
 * 3. ENVOI INDIVIDUEL
 * POST /api/admin/messages/member/:id
 * ============================================
 */
router.post("/member/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content)
    return res
      .status(400)
      .json({ message: "Veuillez renseigner le titre et le contenu." });

  try {
    const memberExists = await db.query(
      "SELECT id FROM members WHERE id=$1",
      [id]
    );
    if (memberExists.rowCount === 0)
      return res.status(404).json({ message: "Membre introuvable." });

    const msg = await db.query(
      `INSERT INTO admin_messages (title, content, target_type, target_value)
       VALUES ($1,$2,'member',$3)
       RETURNING *`,
      [title, content, id]
    );

    await db.query(
      `INSERT INTO admin_message_targets (message_id, member_id)
       VALUES ($1,$2)`,
      [msg.rows[0].id, id]
    );

    return res.json({ success: true, message: msg.rows[0] });
  } catch (e) {
    console.error("Erreur individuel:", e);
    return res.status(500).json({ message: "Erreur interne serveur." });
  }
});

/**
 * ============================================
 * 5. LISTE DES MEMBRES CIBLÉS POUR UN MESSAGE
 * GET /api/admin/messages/targets/:id
 * ============================================
 */
router.get("/targets/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await db.query(
      `SELECT m.*
       FROM admin_message_targets t
       JOIN members m ON m.id = t.member_id
       WHERE t.message_id = $1
       ORDER BY m.name ASC`,
      [id]
    );

    return res.json(rows.rows);

  } catch (e) {
    console.error("Erreur targets:", e);
    return res.status(500).json({ message: "Erreur interne serveur." });
  }
});

/**
 * ============================================
 * 4. HISTORIQUE
 * GET /api/admin/messages/history
 * ============================================
 */
router.get("/history", verifyAdminToken, async (req, res) => {
  try {
    const msgs = await db.query(
      `SELECT *
       FROM admin_messages
       ORDER BY created_at DESC
       LIMIT 200`
    );

    return res.json(msgs.rows);
  } catch (e) {
    console.error("Erreur historique:", e);
    return res.status(500).json({ message: "Erreur interne serveur." });
  }
});

module.exports = router;
