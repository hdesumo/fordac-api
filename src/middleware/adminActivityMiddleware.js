const activity = require("../services/activityService");

/**
 * Middleware qui enregistre automatiquement l’activité d’un admin.
 * 
 * @param {string} action - Le type d’action (ex: UPDATE_MEMBER_STATUS)
 * @param {function|string} descriptionCallback - description dynamique
 * @param {string|null} link - lien vers l’élément (optionnel)
 */
module.exports = function(action, descriptionCallback, link = null) {
  return async (req, res, next) => {
    const admin = req.admin; // injecté par adminMiddleware

    const description =
      typeof descriptionCallback === "function"
        ? descriptionCallback(req)
        : descriptionCallback;

    await activity.logActivity(
      admin.id,
      action,
      description,
      link,
      {
        ip: req.ip,
        agent: req.headers["user-agent"],
      }
    );

    next();
  };
};
