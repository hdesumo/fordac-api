import pool from "../config/db.js";
import transporter from "../config/mail.js";

// ✅ Liste tous les membres
export const listMembers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des membres." });
  }
};

// ✅ Crée un nouveau membre
export const createMember = async (req, res) => {
  const {
    name,
    email,
    phone,
    membership_level,
    departement,
    secteur,
    arrondissement,
  } = req.body;

  // Vérification basique
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Les champs nom, email et téléphone sont obligatoires." });
  }

  try {
    // Vérifie si le membre existe déjà
    const check = await pool.query("SELECT * FROM members WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Un membre avec cet email existe déjà." });
    }

    // Insère un nouveau membre
    const insertQuery = `
      INSERT INTO members (name, email, phone, membership_level, departement, secteur, arrondissement, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *;
    `;
    const values = [name, email, phone, membership_level, departement, secteur, arrondissement];
    const result = await pool.query(insertQuery, values);
    const member = result.rows[0];

    // ✅ Envoi d’un mail de confirmation
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Confirmation de votre adhésion au FORDAC",
      html: `
        <h2>Bienvenue au FORDAC, ${name} !</h2>
        <p>Nous avons bien reçu votre demande d'adhésion.</p>
        <p>Votre statut est actuellement : <strong>En attente de validation</strong>.</p>
        <p>Département : ${departement || "N/A"}<br/>
           Secteur : ${secteur || "N/A"}<br/>
           Arrondissement : ${arrondissement || "N/A"}</p>
        <br/>
        <p>L’équipe FORDAC Connect</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Nouveau membre ajouté : ${member.name} (${member.email})`);
    res.status(201).json({
      message: "Adhésion enregistrée avec succès.",
      member,
    });
  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la création du membre." });
  }
};

// ✅ Récupère un membre par ID
export const getMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur PostgreSQL :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération du membre." });
  }
};
