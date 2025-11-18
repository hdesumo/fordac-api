// controllers/publicationController.js

const db = require("../config/db");
const { notifyMember } = require("../services/memberNotificationService");

// ====================================
// LISTE PUBLICATIONS ACTIVES
// ====================================
exports.getPublications = async (req, res) => {
  try {
    const query = `
      SELECT p.*, m.name AS author_name
      FROM publications p
      LEFT JOIN members m ON m.id = p.member_id
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// PROPOSER UNE PUBLICATION (membre)
// ====================================
exports.submitPublication = async (req, res) => {
  try {
    const { title, content } = req.body;

    const query = `
      INSERT INTO publications (member_id, title, content, status, created_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING *
    `;
    const result = await db.query(query, [req.member.id, title, content]);

    await notifyMember(req.member.id, {
      title: "[Publication] Soumise",
      message: `Votre publication « ${title} » a été soumise et attend validation.`,
      type: "publication",
    });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// VALIDER PUBLICATION (admin)
// ====================================
exports.approvePublication = async (req, res) => {
  try {
    const { publication_id } = req.body;

    const q1 = `
      UPDATE publications
      SET status = 'approved'
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(q1, [publication_id]);

    if (result.rows.length > 0) {
      const pub = result.rows[0];

      await notifyMember(pub.member_id, {
        title: "[Publication] Approuvée",
        message: `Votre publication « ${pub.title} » a été approuvée.`,
        type: "publication",
      });
    }

    res.json({ message: "Publication approuvée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// REFUSER PUBLICATION (admin)
// ====================================
exports.rejectPublication = async (req, res) => {
  try {
    const { publication_id } = req.body;

    const q1 = `
      UPDATE publications
      SET status = 'rejected'
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(q1, [publication_id]);

    if (result.rows.length > 0) {
      const pub = result.rows[0];

      await notifyMember(pub.member_id, {
        title: "[Modération] Publication refusée",
        message: `Votre publication « ${pub.title} » a été refusée.`,
        type: "moderation",
      });
    }

    res.json({ message: "Publication refusée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
