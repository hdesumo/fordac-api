// controllers/superadminMemberController.js
const db = require("../db");
const { logMemberActivity } = require("../middleware/memberActivityMiddleware");

// ======================================================
// GET ALL MEMBERS (Liste + Filtres)
// ======================================================
exports.getMembers = async (req, res) => {
  try {
    const { search = "", secteur = "", arrondissement = "", page = 1 } = req.query;

    const limit = 25;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, phone, quartier, secteur, arrondissement,
             membership_level, status, created_at
      FROM members
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    if (secteur) {
      params.push(secteur);
      query += ` AND secteur = $${params.length}`;
    }

    if (arrondissement) {
      params.push(arrondissement);
      query += ` AND arrondissement = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const members = await db.query(query, params);

    return res.json({
      page: Number(page),
      count: members.rows.length,
      members: members.rows,
    });
  } catch (err) {
    console.error("Erreur getMembers:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// GET SINGLE MEMBER
// ======================================================
exports.getMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT *
      FROM members
      WHERE id=$1
      `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Membre introuvable" });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getMemberById:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// UPDATE MEMBER (Avec journal d’activité)
// ======================================================
exports.updateMember = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    quartier,
    secteur,
    arrondissement,
    membership_level,
    status,
  } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE members
      SET name=$1, email=$2, phone=$3, quartier=$4, secteur=$5,
          arrondissement=$6, membership_level=$7, status=$8
      WHERE id=$9
      RETURNING *
      `,
      [
        name,
        email,
        phone,
        quartier,
        secteur,
        arrondissement,
        membership_level,
        status,
        id,
      ]
    );

    const updated = result.rows[0];

    // Journal d’activité
    await logMemberActivity(
      id,
      "Mise à jour du profil",
      `Profil mis à jour pour ${updated.name}`,
      updated.secteur,
      updated.arrondissement
    );

    return res.json({
      message: "Membre mis à jour avec succès",
      member: updated,
    });
  } catch (err) {
    console.error("Erreur updateMember:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// DELETE MEMBER (Avec journal d’activité)
// ======================================================
exports.deleteMember = async (req, res) => {
  const { id } = req.params;

  try {
    // On récupère les infos avant suppression
    const oldMember = await db.query("SELECT * FROM members WHERE id=$1", [id]);

    if (oldMember.rows.length > 0) {
      const m = oldMember.rows[0];

      await logMemberActivity(
        id,
        "Suppression",
        `Suppression du compte membre : ${m.name}`,
        m.secteur,
        m.arrondissement
      );
    }

    await db.query("DELETE FROM members WHERE id=$1", [id]);

    return res.json({ message: "Membre supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteMember:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
