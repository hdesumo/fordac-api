import pool from "../config/db.js";
import transporter from "../config/mail.js";
import bcrypt from "bcryptjs";

/* ============================================================
   📌 LISTER TOUS LES MEMBRES
   ============================================================ */
export const listMembers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des membres." });
  }
};

/* ============================================================
   📌 CRÉER UN MEMBRE — INSCRIPTION VIA LA VITRINE
   ============================================================ */
export const createMember = async (req, res) => {
  const {
    name,
    email,
    phone,
    membership_level,
    departement,
    secteur,
    arrondissement,
    birthdate,
    profession,
    quartier,
    terms_accepted
  } = req.body;

  // 🔍 Validation stricte
  if (
    !name ||
    !email ||
    !phone ||
    !membership_level ||
    !departement ||
    !secteur ||
    !arrondissement ||
    !birthdate ||
    !profession ||
    !quartier ||
    terms_accepted !== true
  ) {
    return res.status(400).json({
      error: "Tous les champs sont obligatoires et la charte doit être acceptée."
    });
  }

  try {
    // 🔍 Vérifier doublon email
    const check = await pool.query(
      "SELECT id FROM members WHERE email = $1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        error: "Un membre avec cet email existe déjà."
      });
    }

    // 🟢 Insérer la demande d'adhésion
    const query = `
      INSERT INTO members (
        name, email, phone, membership_level,
        departement, secteur, arrondissement,
        birthdate, profession, quartier, terms_accepted, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending')
      RETURNING *;
    `;

    const values = [
      name,
      email,
      phone,
      membership_level,
      departement,
      secteur,
      arrondissement,
      birthdate,
      profession,
      quartier,
      true
    ];

    const result = await pool.query(query, values);
    const member = result.rows[0];

    // Envoi d’un email automatique (réception de demande)
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Votre demande d'adhésion au FORDAC",
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Votre demande d’adhésion a bien été reçue.</p>
        <p>Status : <strong>En attente de validation</strong>.</p>
        <p>Vous serez contacté(e) dès que votre adhésion sera approuvée.</p>
        <p>L’équipe FORDAC Connect</p>
      `
    });

    res.status(201).json({
      message: "Demande d'adhésion enregistrée.",
      member
    });

  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la création du membre." });
  }
};

/* ============================================================
   📌 APPROUVER UN MEMBRE — ADMIN
   ============================================================ */
export const approveMember = async (req, res) => {
  const { id } = req.params;

  try {
    // 📌 Vérifier existence
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }

    const member = result.rows[0];

    if (member.status === "approved") {
      return res.status(400).json({ error: "Ce membre est déjà approuvé." });
    }

    // 🔐 Génération mot de passe aléatoire
    const rawPassword = "fordac" + Math.floor(1000 + Math.random() * 9000);
    const hashed = await bcrypt.hash(rawPassword, 10);

    // Mise à jour du statut
    const update = await pool.query(
      `
      UPDATE members
      SET status = 'approved', password = $1
      WHERE id = $2
      RETURNING *;
      `,
      [hashed, id]
    );

    const updated = update.rows[0];

    // Envoi mail avec identifiants
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: updated.email,
      subject: "Votre adhésion au FORDAC est approuvée",
      html: `
        <h2>Bienvenue officiellement au FORDAC, ${updated.name} !</h2>
        <p>Votre adhésion a été validée.</p>
        <p><strong>Identifiants de connexion :</strong></p>
        <p>
          Email : ${updated.email}<br/>
          Mot de passe : <strong>${rawPassword}</strong>
        </p>
        <p>Vous pouvez désormais accéder à votre espace militant.</p>
        <br/>
        <p>FORDAC Connect</p>
      `,
    });

    res.json({
      message: "Membre approuvé avec succès.",
      member: updated
    });

  } catch (error) {
    console.error("❌ Erreur approbation membre :", error.message);
    res.status(500).json({ error: "Erreur lors de l'approbation du membre." });
  }
};

/* ============================================================
   📌 RÉCUPÉRER UN MEMBRE PAR ID
   ============================================================ */
export const getMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération du membre." });
  }
};
