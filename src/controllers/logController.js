const { ActivityLog } = require("../models");

module.exports = {
  logActivity: async (action, user) => {
    try {
      await ActivityLog.create({ action, user });
    } catch (err) {
      console.log("Erreur lors de l'enregistrement du log", err);
    }
  }
};
