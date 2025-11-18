const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Services
const activity = require("../services/activityService");
const superadminNotify = require("../services/superadminNotificationService");

// =======================================================
// 🔐 LOGIN ADMIN
// =======================================================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, name, email, password, service
       FROM admins
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email introuvable." });
    }

    const admin = result.rows[0];

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Génération du token
    const token = jwt.sign(
      {
        id: admin.id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // =======================================================
    // 🔔 1. Journal d'activité (ADMIN)
    // =======================================================
    await activity.logActivity(
      admin.id,
      "Connexion",
      `L'administrateur ${admin.name} s'est connecté.`,
      "/admin/dashboard",
      {
        ip: req.ip,
        agent: req.headers["user-agent"],
      }
    );

    // =======================================================
    // 🔔 2. Notification SuperAdmin
    // =======================================================
    await superadminNotify.notifySuperAdmin(
      "info",
      "Connexion administrateur",
      `${admin.name} vient de se connecter.`,
      "/superadmin/activities"
    );

    // =======================================================
    // 🔁 3. Réponse front
    // =======================================================
    return res.json({
      message: "Connexion réussie",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        service: admin.service,
      },
    });

  } catch (error) {
    console.error("Erreur adminLogin:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
