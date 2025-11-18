// controllers/memberNotificationsController.js

const MemberNotifications = require("../models/memberNotifications")(require("../config/db"));

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await MemberNotifications.getByMember(req.member.id);
    return res.json(notifications);
  } catch (error) {
    console.error("Erreur notifications membre :", error);
    return res.status(500).json({ message: "Erreur interne." });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await MemberNotifications.markAllAsRead(req.member.id);
    return res.json({ message: "Notifications mises à jour." });
  } catch (error) {
    console.error("Erreur MAJ notifications :", error);
    return res.status(500).json({ message: "Erreur interne." });
  }
};
