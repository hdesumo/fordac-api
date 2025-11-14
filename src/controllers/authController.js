// src/controllers/authController.js
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;

// Note: init.sql inserted plaintext demo passwords as requested.
// But in register/update flows we will hash passwords.

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const q = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (q.rowCount === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = q.rows[0];

    // Compare hashed or plaintext depending on storage
    const stored = user.password || "";
    let match = false;

    if (stored.startsWith("$2")) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    delete user.password; // remove before sending
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerAdmin = async (req, res) => {
  // only superadmin should call this route (middleware)
  const { name, email, password = "fordac2025", phone, service_assigned } =
    req.body;

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const q = await pool.query(
      `INSERT INTO users (name,email,password,role,phone,service_assigned,status)
       VALUES ($1,$2,$3,'admin',$4,$5,'approved')
       RETURNING id,name,email,role`,
      [name, email, hashed, phone || null, service_assigned || null]
    );

    res.status(201).json({ admin: q.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerMember = async (req, res) => {
  const {
    name,
    email,
    password = "fordac2025",
    phone,
    membership_level,
    region_id,
    departement_id,
    zone_id,
    arrondissement_id,
  } = req.body;

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const q = await pool.query(
      `INSERT INTO users (
        name,email,password,role,phone,
        membership_level,status,
        region_id,departement_id,zone_id,arrondissement_id
       )
       VALUES (
        $1,$2,$3,'member',$4,
        $5,'pending',
        $6,$7,$8,$9
       )
       RETURNING id,name,email,status`,

      [
        name,
        email,
        hashed,
        phone || null,
        membership_level || "Base",
        region_id,
        departement_id,
        zone_id,
        arrondissement_id,
      ]
    );

    res.status(201).json({ member: q.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const q = await pool.query("SELECT id,email FROM users WHERE email=$1", [
      email,
    ]);

    if (q.rowCount === 0)
      return res.status(404).json({ message: "Email not found" });

    const token = crypto.randomBytes(20).toString("hex");

    // V1: we return token as simulation (should store it in DB in V2)
    res.json({ message: "Simulated recovery token (V1)", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { user } = req; // from verifyToken
  const { oldPassword, newPassword } = req.body;

  try {
    const q = await pool.query("SELECT password FROM users WHERE id=$1", [
      user.id,
    ]);

    if (q.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    const stored = q.rows[0].password;

    let ok = false;

    if (stored.startsWith("$2")) {
      ok = await bcrypt.compare(oldPassword, stored);
    } else {
      ok = oldPassword === stored;
    }

    if (!ok)
      return res.status(403).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query(
      "UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2",
      [hashed, user.id]
    );

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
