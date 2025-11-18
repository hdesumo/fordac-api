const express = require("express");
const router = express.Router();
const db = require("../config/db");
const superadminMiddleware = require("../middleware/superadminMiddleware");

// Stats globales
router.get("/stats", superadminMiddleware, async (req, res) => {
  try {
    const totalMembres = await db.query("SELECT COUNT(*) FROM users");
    const adminsActifs = await db.query(
      "SELECT COUNT(*) FROM admins WHERE role='admin'"
    );

    const publications = await db.query("SELECT COUNT(*) FROM posts");
    const sujets = await db.query("SELECT COUNT(*) FROM forum_topics");
    const commentaires = await db.query("SELECT COUNT(*) FROM forum_comments");

    const sujetsSignales = await db.query(
      "SELECT COUNT(*) FROM forum_topics WHERE flagged=true"
    );

    const totalSignales = await db.query(
      "SELECT COUNT(*) FROM posts WHERE flagged=true"
    );

    const moungoNord = await db.query(
      "SELECT COUNT(*) FROM users WHERE arrondissement LIKE '%Nord%'"
    );

    const moungoSud = await db.query(
      "SELECT COUNT(*) FROM users WHERE arrondissement LIKE '%Sud%'"
    );

    const arrActifs = await db.query(`
      SELECT COUNT(DISTINCT arrondissement) FROM users
    `);

    // Activités admins (10 dernières)
    const activities = await db.query(`
      SELECT a.action, a.description, 
             TO_CHAR(a.created_at, 'DD/MM/YYYY HH24:MI') AS date,
             ad.name AS admin_name
      FROM admin_activities a
      LEFT JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.id DESC
      LIMIT 10
    `);

    res.json({
      totalMembres: parseInt(totalMembres.rows[0].count),
      adminsActifs: parseInt(adminsActifs.rows[0].count),
      publications: parseInt(publications.rows[0].count),
      sujets: parseInt(sujets.rows[0].count),
      commentaires: parseInt(commentaires.rows[0].count),
      sujetsSignales: parseInt(sujetsSignales.rows[0].count),
      totalSignales: parseInt(totalSignales.rows[0].count),
      moungoNord: parseInt(moungoNord.rows[0].count),
      moungoSud: parseInt(moungoSud.rows[0].count),
      arrActifs: parseInt(arrActifs.rows[0].count),
      activities: activities.rows,
    });

  } catch (err) {
    console.error("Erreur superadmin stats:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
