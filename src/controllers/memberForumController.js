const forumService = require("../services/forumService");

// ================================
// 📌 GET — Liste paginée des sujets
// ================================
exports.getSujets = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 10;

    const result = await forumService.getSujets(page, limit);

    return res.json(result);
  } catch (error) {
    console.error("Erreur getSujets:", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

// ================================
// 📌 GET — Détail d’un sujet + commentaires
// ================================
exports.getSujetById = async (req, res) => {
  try {
    const sujetId = req.params.id;
    const sujet = await forumService.getSujetById(sujetId);

    if (!sujet) {
      return res.status(404).json({ error: "Sujet introuvable." });
    }

    return res.json(sujet);
  } catch (error) {
    console.error("Erreur getSujetById:", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

// ================================
// 📌 POST — Création d’un sujet
// ================================
exports.createSujet = async (req, res) => {
  try {
    const memberId = req.member.id; // vient du middleware
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Titre et description requis." });
    }

    const newSujet = await forumService.createSujet(
      memberId,
      title,
      description
    );

    return res.status(201).json(newSujet);
  } catch (error) {
    console.error("Erreur createSujet:", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

// ================================
// 📌 POST — Création d’un commentaire
// ================================
exports.createCommentaire = async (req, res) => {
  try {
    const sujetId = req.params.id;
    const memberId = req.member.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Commentaire requis." });
    }

    const comment = await forumService.createCommentaire(
      memberId,
      sujetId,
      content
    );

    return res.status(201).json(comment);
  } catch (error) {
    console.error("Erreur createCommentaire:", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};
