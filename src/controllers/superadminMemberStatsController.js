const db = require("../config/db");

// ======================================================================
// STATS COMPLETES POUR LE SUPERADMIN
// ======================================================================
exports.getMemberStats = async (req, res) => {
  try {
    // ------------------------------
    // 1. Évolution mensuelle (12 mois)
    // ------------------------------
    const monthly = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM members
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1
      ORDER BY 1;
    `);

    // ------------------------------
    // 2. Répartition par secteur
    // ------------------------------
    const secteurs = await db.query(`
      SELECT secteur, COUNT(*) AS count
      FROM members
      WHERE secteur IS NOT NULL AND secteur <> ''
      GROUP BY secteur;
    `);

    // ------------------------------
    // 3. Répartition par arrondissement
    // ------------------------------
    const arrondissements = await db.query(`
      SELECT arrondissement, COUNT(*) AS count
      FROM members
      WHERE arrondissement IS NOT NULL AND arrondissement <> ''
      GROUP BY arrondissement;
    `);

    // ------------------------------
    // 4. Répartition par niveau (Bronze/Argent/Or)
    // ------------------------------
    const levels = await db.query(`
      SELECT membership_level, COUNT(*) AS count
      FROM members
      WHERE membership_level IS NOT NULL AND membership_level <> ''
      GROUP BY membership_level;
    `);

    return res.json({
      monthly: monthly.rows,
      secteurs: secteurs.rows,
      arrondissements: arrondissements.rows,
      levels: levels.rows
    });

  } catch (err) {
    console.error("Erreur getMemberStats:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
