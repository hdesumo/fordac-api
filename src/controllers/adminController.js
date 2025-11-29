const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Admin, Member, Notification } = require("../models");

module.exports = {
  // LOGIN ADMIN
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ where: { email } });
      if (!admin) return res.status(404).json({ message: "Admin introuvable" });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

      const token = jwt.sign(
        { id: admin.id, role: "admin", email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Connexion réussie",
        token,
        user: { id: admin.id, role: "admin", email: admin.email }
      });
    } catch (err) {
      res.status(500).json({ message: "Erreur interne" });
    }
  },

  // DASHBOARD STATS
  getDashboardStats: async (req, res) => {
    try {
      const totalMembers = await Member.count();
      const unreadNotifications = await Notification.count({
        where: { is_read: false }
      });
      const approvedMemberships = await Member.count({ where: { status: "validé" } });
      const pendingMemberships = await Member.count({ where: { status: "en attente" } });

      res.json({
        totalMembers,
        unreadNotifications,
        approvedMemberships,
        pendingMemberships
      });
    } catch (err) {
      res.status(500).json({ message: "Erreur interne" });
    }
  },

  // LISTE DES MEMBRES
  getMembers: async (req, res) => {
    try {
      const members = await Member.findAll({
        order: [["createdAt", "DESC"]],
        limit: 100
      });

      res.json(members);
    } catch (err) {
      res.status(500).json({ message: "Erreur interne" });
    }
  },

  // NOTIFICATIONS NON LUES
  getUnreadNotifications: async (req, res) => {
    try {
      const notifs = await Notification.findAll({
        where: { is_read: false },
        order: [["createdAt", "DESC"]]
      });

      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: "Erreur interne" });
    }
  }
};
