// controllers/commentController.js

const db = require("../config/db");
const { notifyMember } = require("../services/memberNotificationService");

// ====================================
// COMMENTER UNE PUBLICATION
// ====================================
exports.commentPublication = async (req, res) => {
  try {
    const { publication_id, content } = req.body;

    const q1 = `
      INSERT INTO publication_comments (publication_id, member_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const comment = await db.query(q1, [publication_id, req.member.id, content]);

    // Récupérer publication
    const q2 = "SELECT * FROM publications WHERE id = $1";
    const pub = await db.query(q2, [publication_id]);

    if (pub.rows.length > 0) {
      const authorId = pub.rows[0].member_id;

      if (authorId !== req.member.id) {
        await notifyMember(authorId, {
          title: "[Publication] Nouveau commentaire",
          message: `Un membre a commenté votre publication : « ${pub.rows[0].title} ».`,
          type: "publication",
        });
      }
    }

    res.json(comment.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
