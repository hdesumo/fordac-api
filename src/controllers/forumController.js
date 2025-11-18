// controllers/forumController.js

const db = require("../config/db");
const { notifyMember } = require("../services/memberNotificationService");

// ====================================
// LISTE DES SUJETS
// ====================================
exports.getTopics = async (req, res) => {
  try {
    const query = `
      SELECT t.*, m.name AS author_name
      FROM forum_topics t
      LEFT JOIN members m ON m.id = t.member_id
      ORDER BY t.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// CRÉER UN SUJET
// ====================================
exports.createTopic = async (req, res) => {
  try {
    const { title, content } = req.body;

    const query = `
      INSERT INTO forum_topics (member_id, title, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await db.query(query, [req.member.id, title, content]);

    // Notification institutionnelle
    await notifyMember(req.member.id, {
      title: "[Forum] Sujet créé",
      message: `Votre sujet « ${title} » a été créé avec succès.`,
      type: "forum",
    });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// RÉPONDRE À UN SUJET
// ====================================
exports.replyToTopic = async (req, res) => {
  try {
    const { topic_id, content } = req.body;

    // Ajouter réponse
    const insertQuery = `
      INSERT INTO forum_replies (topic_id, member_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const reply = await db.query(insertQuery, [topic_id, req.member.id, content]);

    // Récupérer le topic
    const topicQuery = "SELECT * FROM forum_topics WHERE id = $1";
    const topic = await db.query(topicQuery, [topic_id]);

    if (topic.rows.length > 0) {
      const authorId = topic.rows[0].member_id;

      // Ne pas notifier soi-même
      if (authorId !== req.member.id) {
        await notifyMember(authorId, {
          title: "[Forum] Nouvelle réponse",
          message: `Un membre a répondu à votre sujet : « ${topic.rows[0].title} ».`,
          type: "forum",
        });
      }
    }

    res.json(reply.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ====================================
// FERMER UN SUJET
// ====================================
exports.closeTopic = async (req, res) => {
  try {
    const { topic_id } = req.body;

    // Fermer le sujet
    await db.query(
      "UPDATE forum_topics SET is_closed = true WHERE id = $1",
      [topic_id]
    );

    // Auteur du sujet
    const topic = await db.query(
      "SELECT * FROM forum_topics WHERE id = $1",
      [topic_id]
    );

    if (topic.rows.length > 0) {
      await notifyMember(topic.rows[0].member_id, {
        title: "[Modération] Sujet fermé",
        message: `Votre sujet « ${topic.rows[0].title} » a été fermé par l'administration.`,
        type: "moderation",
      });
    }

    res.json({ message: "Sujet fermé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
