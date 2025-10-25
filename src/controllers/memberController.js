import pool from "../db.js";

/**
 * 📋 Liste des membres (admins & superadmin)
 */
export const listMembers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, membership_level, status, arrondissement, departement, region, created_at FROM users WHERE role='member' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur listMembers:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};

/**
 * 🔍 Récupérer un membre par ID
 */
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, email, phone, membership_level, status, arrondissement, departement, region, created_at FROM users WHERE id=$1 AND role='member'",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Membre introuvable." });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur getMemberById:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};

/**
 * 📝 Créer un membre (inscription publique)
 */
export const createMember = async (req, res) => {
  try {
    const { name, email, phone, arrondissement, membership_level } = req.body;

    const exist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (exist.rows.length > 0)
      return res.status(400).json({ message: "Cet email est déjà enregistré." });

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, role, arrondissement, departement, region, membership_level, status)
       VALUES ($1,$2,$3,'member',$4,'Moungo','Littoral',$5,'pending')
       RETURNING id, name, email, phone, arrondissement, membership_level, status`,
      [name, email, phone, arrondissement, membership_level || "Base"]
    );

    res.status(201).json({
      message: "Demande d’adhésion enregistrée avec succès.",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur createMember:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};
