// src/controllers/authController.js

import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;

/* ============================================================
   🔐 LOGIN UTILISATEUR (ADMIN / MEMBER)
   ============================================================ */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const q = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (q.rowCount === 0)
      return res.status(401).json({ message: "Identifiants incorrects" });

    const user = q.rows[0];

    // Vérification du mot de passe (hash ou plaintext)
    const stored = user.password || "";
    let match = false;

    if (stored.startsWith("$2")) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match)
      return res.status(401).json({ message: "Identifiants incorrects" });

    const token = generateToken(user);
    delete user.password;

    return res.json({
      message: "Connexion réussie",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   👑 LOGIN SUPERADMIN
   ============================================================ */
export const superadminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const q = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND role='superadmin'",
      [email]
    );

    if (q.rowCount === 0)
      return res.status(401).json({ message: "Non autorisé" });

    const admin = q.rows[0];

    const stored = admin.password || "";
    let valid = false;

    if (stored.startsWith("$2")) {
      valid = await bcrypt.compare(password, stored);
    } else {
      valid = password === stored;
    }

    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = generateToken(admin);
    delete admin.password;

    return res.json({
      message: "Connexion superadmin réussie",
      token,
      admin,
    });
  } catch (err) {
    console.error("❌ SUPERADMIN LOGIN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🟢 CRÉATION D’ADMIN (SUPERADMIN UNIQUEMENT)
   ============================================================ */
export const registerAdmin = async (req, res) => {
  const { name, email, password = "fordac2025", phone, service_assigned } =
    req.body;

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const q = await pool.query(
      `
      INSERT INTO users (name,email,password,role,phone,service_assigned,status)
      VALUES ($1,$2,$3,'admin',$4,$5,'approved')
      RETURNING id,name,email,role
      `,
      [name, email, hashed, phone || null, service_assigned || null]
    );

    return res.status(201).json({
      message: "Admin créé avec succès",
      admin: q.rows[0],
    });
  } catch (err) {
    console.error("❌ REGISTER ADMIN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🟩 CRÉATION DE MEMBRE
   ============================================================ */
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
      `
      INSERT INTO users (
        name,email,password,role,phone,
        membership_level,status,
        region_id,departement_id,zone_id,arrondissement_id
      )
      VALUES ($1,$2,$3,'member',$4,$5,'pending',$6,$7,$8,$9)
      RETURNING id,name,email,status
      `,
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

    return res.status(201).json({
      message: "Membre enregistré",
      member: q.rows[0],
    });
  } catch (err) {
    console.error("❌ REGISTER MEMBER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🔄 MOT DE PASSE OUBLIÉ (VERSION SIMPLIFIÉE)
   ============================================================ */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const q = await pool.query("SELECT id,email FROM users WHERE email=$1", [
      email,
    ]);

    if (q.rowCount === 0)
      return res.status(404).json({ message: "Email introuvable" });

    const token = crypto.randomBytes(20).toString("hex");

    return res.json({
      message: "Token de récupération généré (mode démo)",
      token,
    });
  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🔐 CHANGE PASSWORD
   ============================================================ */
export const changePassword = async (req, res) => {
  const { user } = req; // injecté par requireAuth
  const { oldPassword, newPassword } = req.body;

  try {
    const q = await pool.query("SELECT password FROM users WHERE id=$1", [
      user.id,
    ]);

    if (q.rowCount === 0)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const stored = q.rows[0].password;
    let ok = false;

    if (stored.startsWith("$2")) {
      ok = await bcrypt.compare(oldPassword, stored);
    } else {
      ok = oldPassword === stored;
    }

    if (!ok)
      return res.status(403).json({ message: "Ancien mot de passe incorrect" });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query(
      "UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2",
      [hashed, user.id]
    );

    return res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("❌ CHANGE PASSWORD ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   👤 PROFIL UTILISATEUR CONNECTÉ
   ============================================================ */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ message: "Non authentifié" });

    const q = await pool.query(
      `
      SELECT id,name,email,phone,role,membership_level,status,service_assigned
      FROM users
      WHERE id=$1
      `,
      [userId]
    );

    if (q.rowCount === 0)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    return res.json(q.rows[0]);
  } catch (err) {
    console.error("❌ GET PROFILE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
