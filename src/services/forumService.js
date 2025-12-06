const pool = require("../db");

// ================================
// 📌 Récupération liste paginée des sujets
// ================================
exports.getSujets = async (page, limit) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      fs.*, 
      m.name AS author_name
    FROM forum_sujets fs
    LEFT JOIN members m ON m.id = fs.member_id
    ORDER BY fs.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const totalQuery = `SELECT COUNT(*) FROM forum_sujets`;

  const [rows, total] = await Promise.all([
    pool.query(query, [limit, offset]),
    pool.query(totalQuery)
  ]);

  return {
    items: rows.rows,
    totalPages: Math.ceil(total.rows[0].count / limit),
  };
};

// ================================
// 📌 Récupérer un sujet + commentaires
// ================================
exports.getSujetById = async (id) => {
  const sujetQuery = `
    SELECT 
      fs.*, 
      m.name AS author_name
    FROM forum_sujets fs
    LEFT JOIN members m ON m.id = fs.member_id
    WHERE fs.id = $1
  `;
  const sujetResult = await pool.query(sujetQuery, [id]);

  if (sujetResult.rows.length === 0) return null;

  const sujet = sujetResult.rows[0];

  const commentsQuery = `
    SELECT 
      fc.*, 
      mem.name AS author_name
    FROM forum_comments fc
    LEFT JOIN members mem ON mem.id = fc.member_id
    WHERE fc.sujet_id = $1
    ORDER BY fc.created_at ASC
  `;
  const commentsResult = await pool.query(commentsQuery, [id]);

  sujet.comments = commentsResult.rows;

  return sujet;
};

// ================================
// 📌 Création d’un sujet
// ================================
exports.createSujet = async (memberId, title, description) => {
  const query = `
    INSERT INTO forum_sujets (member_id, title, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [memberId, title, description]);
  return result.rows[0];
};

// ================================
// 📌 Création d’un commentaire
// ================================
exports.createCommentaire = async (memberId, sujetId, content) => {
  const query = `
    INSERT INTO forum_comments (member_id, sujet_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [memberId, sujetId, content]);
  return result.rows[0];
};
