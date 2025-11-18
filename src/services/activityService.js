const db = require("../db");

async function logActivity(admin_id, action, description, link = null, meta = {}) {
  const ip = meta.ip || null;
  const agent = meta.agent || null;

  try {
    await db.query(
      `
      INSERT INTO admin_activities(admin_id, action, description, ip_address, user_agent, link)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [admin_id, action, description, ip, agent, link]
    );
  } catch (error) {
    console.error("Erreur logActivity:", error);
  }
}

module.exports = {
  logActivity,
};
