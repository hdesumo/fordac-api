const db = require("../db");
const bcrypt = require("bcrypt");

// ======================================================
// GET ALL ADMINS
// ======================================================
exports.getAdmins = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, email, service, role, created_at
      FROM admins
      ORDER BY id DESC
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("Erreur getAdmins:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// GET ADMIN BY ID
// ======================================================
exports.getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT id, name, email, service, role, created_at
      FROM admins
      WHERE id=$1
    `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Administrateur introuvable" });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getAdminById:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// CREATE ADMIN
// ======================================================
exports.createAdmin = async (req, res) => {
  const { name, email, password, service } = req.body;

  try {
    // Vérification email
    const check = await db.query(
      `SELECT id FROM admins WHERE email=$1`,
      [email]
    );

    if (check.rows.length > 0)
      return res
        .status(400)
        .json({ message: "Un administrateur avec cet email existe déjà" });

    // Hash du mot de passe
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO admins (name, email, password, service)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, service, role, created_at
    `,
      [name, email, hashed, service]
    );

    return res.json({
      message: "Administrateur créé avec succès",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur createAdmin:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// UPDATE ADMIN
// ======================================================
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, service } = req.body;

  try {
    // Vérifier existence
    const check = await db.query(
      `SELECT id FROM admins WHERE id=$1`,
      [id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Administrateur introuvable" });

    // Hash si mot de passe fourni
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await db.query(
      `
      UPDATE admins
      SET 
        name=$1,
        email=$2,
        service=$3,
        password = COALESCE($4, password)
      WHERE id=$5
      RETURNING id, name, email, service, role, created_at
    `,
      [name, email, service, hashedPassword, id]
    );

    return res.json({
      message: "Administrateur mis à jour avec succès",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur updateAdmin:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// DELETE ADMIN
// ======================================================
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM admins WHERE id=$1`, [id]);
    return res.json({ message: "Administrateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteAdmin:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// RESET PASSWORD (VERSION SECURISÉE)
// ======================================================
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const NEW_PASSWORD = "admin123"; // mot de passe de secours
  try {
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    await db.query(
      `UPDATE admins SET password=$1 WHERE id=$2`,
      [hashed, id]
    );

    return res.json({
      message: "Mot de passe réinitialisé",
      newPassword: NEW_PASSWORD,
    });
  } catch (err) {
    console.error("Erreur resetPassword:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
