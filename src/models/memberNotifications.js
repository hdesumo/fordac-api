// models/memberNotifications.js

module.exports = (db) => {
  const MemberNotifications = {
    // Récupérer toutes les notifications d’un membre
    async getByMember(memberId) {
      const query = `
        SELECT * FROM member_notifications
        WHERE member_id = $1
        ORDER BY created_at DESC
      `;
      const result = await db.query(query, [memberId]);
      return result.rows;
    },

    // Créer une notification
    async create({ member_id, title, message }) {
      const query = `
        INSERT INTO member_notifications (member_id, title, message, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;
      const result = await db.query(query, [member_id, title, message]);
      return result.rows[0];
    },

    // Compter les notifications non lues
    async countUnread(memberId) {
      const query = `
        SELECT COUNT(*) FROM member_notifications
        WHERE member_id = $1 AND is_read = false
      `;
      const result = await db.query(query, [memberId]);
      return parseInt(result.rows[0].count, 10);
    },

    // Marquer toutes les notifications comme lues
    async markAllAsRead(memberId) {
      const query = `
        UPDATE member_notifications
        SET is_read = true
        WHERE member_id = $1
      `;
      await db.query(query, [memberId]);
      return true;
    },
  };

  return MemberNotifications;
};
