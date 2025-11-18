// services/memberNotificationService.js

const db = require("../config/db");

async function notifyMember(member_id, { title, message, type = "general" }) {
  const query = `
    INSERT INTO member_notifications (member_id, title, message, type, created_at)
    VALUES ($1, $2, $3, $4, NOW())
  `;
  await db.query(query, [member_id, title, message, type]);
}

module.exports = { notifyMember };
