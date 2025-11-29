const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * SUPERADMIN CONTROLLER
 * Compatible PostgreSQL / pool.query()
 * Sans Sequelize — 100% stable
 */

module.exports = {
  // ---------------------------------------------------------
  // LOGIN SUPERADMIN
  // ---------------------------------------------------------
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Chercher le superadmin via email
      const result = await pool.query(
        "SELECT * FROM superadmin WHERE email = $1 LIMIT 1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "SuperAdmin introuvable" });
      }

      const superAdmin = result.rows[0];

      // Vérification du mot de passe hashé
      const match = await bcrypt.compare(password, superAdmin.password);

      if (!match) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }

      // Génération du token
      const token = jwt.sign(
        {
          id: superAdmin.id,
          role: "superadmin",
          email: superAdmin.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: superAdmin.id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: "superadmin",
        },
      });
    } catch (error) {
      console.error("Superadmin login error:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // ---------------------------------------------------------
  // STATS SUPERADMIN (Dashboard)
  // ---------------------------------------------------------
  getDashboardStats: async (req, res) => {
    try {
      const totalMembers = await pool.query("SELECT COUNT(*) FROM members");
      const totalAdmins = await pool.query("SELECT COUNT(*) FROM admins");
      const totalNotifications = await pool.query(
        "SELECT COUNT(*) FROM superadmin_notifications WHERE is_read = false"
      );
      const totalPublications = await pool.query("SELECT COUNT(*) FROM posts");

      return res.json({
        totalMembers: totalMembers.rows[0].count,
        totalAdmins: totalAdmins.rows[0].count,
        unreadNotifications: totalNotifications.rows[0].count,
        totalPosts: totalPublications.rows[0].count,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // ---------------------------------------------------------
  // LISTE DES ADMINS
  // ---------------------------------------------------------
  getAdmins: async (req, res) => {
    try {
      const admins = await pool.query(
        "SELECT id, name, email, created_at FROM admins ORDER BY created_at DESC"
      );

      return res.json(admins.rows);
    } catch (error) {
      console.error("Get admins error:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // ---------------------------------------------------------
  // MEMBRES RÉCENTS
  // ---------------------------------------------------------
  getRecentMembers: async (req, res) => {
    try {
      const recent = await pool.query(
        "SELECT id, name, email, created_at FROM members ORDER BY created_at DESC LIMIT 10"
      );

      return res.json(recent.rows);
    } catch (error) {
      console.error("Recent members error:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // ---------------------------------------------------------
  // ACTIVITÉS RÉCENTES
  // ---------------------------------------------------------
  getRecentActivity: async (req, res) => {
    try {
      const activity = await pool.query(
        `SELECT * FROM superadmin_notifications 
         ORDER BY created_at DESC 
         LIMIT 10`
      );

      return res.json(activity.rows);
    } catch (error) {
      console.error("Recent activity error:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
};
