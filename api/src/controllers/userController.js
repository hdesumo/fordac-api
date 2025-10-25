import pool from "../config/db.js";

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
