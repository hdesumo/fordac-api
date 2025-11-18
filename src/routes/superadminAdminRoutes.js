const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const superadminMiddleware = require("../middleware/superadminMiddleware");

// LISTE DES ADMINS
router.get("/", superadminMiddleware, async (req, res) => {
  const admins = await db.query("SELECT * FROM admins ORDER BY id DESC");
  res.json({ admins: admins.rows });
});

// CREATION ADMIN
router.post("/create", superadminMiddleware, async (req, res) => {
  const { name, email, password, service } = req.body;

  const exists = await db.query("SELECT id FROM admins WHERE email=$1", [
    email,
  ]);
  if (exists.rows.length > 0)
    return res.status(400).json({ message: "Cet email existe déjà" });

  const hash = bcrypt.hashSync(password, 10);

  await db.query(
    "INSERT INTO admins (name, email, password, service) VALUES ($1,$2,$3,$4)",
    [name, email, hash, service]
  );

  res.json({ success: true });
});

// FICHE ADMIN
router.get("/:id", superadminMiddleware, async (req, res) => {
  const admin = await db.query("SELECT * FROM admins WHERE id=$1", [
    req.params.id,
  ]);

  if (admin.rows.length === 0)
    return res.status(404).json({ message: "Admin introuvable" });

  res.json({ admin: admin.rows[0] });
});

// RESET PASSWORD
router.put("/reset-password/:id", superadminMiddleware, async (req, res) => {
  const newPass = bcrypt.hashSync("admin123", 10);

  await db.query("UPDATE admins SET password=$1 WHERE id=$2", [
    newPass,
    req.params.id,
  ]);

  res.json({ success: true });
});

// SUPPRIMER ADMIN
router.delete("/delete/:id", superadminMiddleware, async (req, res) => {
  await db.query("DELETE FROM admins WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
