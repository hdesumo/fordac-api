const db = require("../db");

/**
 * Crée une notification interne pour un administrateur
 */
async function notifyAdmin(adminId, type, title, message) {
  try {
    await db.query(
      `
      INSERT INTO admin_notifications(admin_id, type, title, message)
      VALUES ($1, $2, $3, $4)
      `,
      [adminId, type, title, message]
    );
  } catch (err) {
    console.error("Erreur notifyAdmin:", err);
  }
}

module.exports = {
  notifyAdmin,
};
