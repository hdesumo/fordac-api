const { Notification } = require("../models");

module.exports = {
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;

      await Notification.update(
        { is_read: true },
        { where: { id } }
      );

      res.json({ message: "Notification lue" });
    } catch (err) {
      res.status(500).json({ message: "Erreur interne" });
    }
  }
};
