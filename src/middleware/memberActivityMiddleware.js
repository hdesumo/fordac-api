// middleware/memberActivityMiddleware.js
const db = require("../config/db");

exports.logMemberActivity = async (
  memberId,
  action,
  description = "",
  secteur = null,
  arrondissement = null
) => {
  try {
    await db.query(
      `
      INSERT INTO member_activities (member_id, action, description, secteur, arrondissement)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [memberId, action, description, secteur, arrondissement]
    );
  } catch (err) {
    console.error("Erreur logMemberActivity:", err);
  }
};
