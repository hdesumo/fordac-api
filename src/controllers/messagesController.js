const pool = require("../config/db.js");

exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { recipient_id, subject, body } = req.body;

  try {
    const r = await pool.query(
      "INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES ($1,$2,$3,$4) RETURNING id,created_at",
      [senderId, recipient_id, subject, body]
    );
    res.status(201).json({
      message: "Sent",
      id: r.rows[0].id,
      created_at: r.rows[0].created_at
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.inbox = async (req, res) => {
  const userId = req.user.id;
  try {
    const q = await pool.query(
      "SELECT m.id, m.sender_id, u.name as sender_name, m.subject, m.body, m.is_read, m.created_at FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.recipient_id=$1 ORDER BY m.created_at DESC",
      [userId]
    );
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sent = async (req, res) => {
  const userId = req.user.id;
  try {
    const q = await pool.query(
      "SELECT m.id, m.recipient_id, u.name as recipient_name, m.subject, m.body, m.created_at FROM messages m JOIN users u ON u.id = m.recipient_id WHERE m.sender_id=$1 ORDER BY m.created_at DESC",
      [userId]
    );
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE messages SET is_read=true WHERE id=$1", [id]);
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
