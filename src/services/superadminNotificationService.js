const db = require("../db");

async function notifySuperAdmin(type, title, message, link = null) {
  try {
    await db.query(
      `
      INSERT INTO superadmin_notifications (type, title, message, link)
      VALUES ($1, $2, $3, $4)
      `,
      [type, title, message, link]
    );
  } catch (error) {
    console.error("Erreur notifySuperAdmin:", error);
  }
}

module.exports = {
  notifySuperAdmin
};
