import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );
    if (result.rowCount === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
