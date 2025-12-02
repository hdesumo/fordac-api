// =======================================================
//  CONTROLLER ADHESION — FORDAC CONNECT
// =======================================================

const pool = require("../db");
const transporter = require("../services/mail");

// =======================================================
//  ADHESION : CRÉATION D’UN MEMBRE
// =======================================================

exports.createMember = async (req, res) => {
  const {
    name,
    email,
    phone,
    birthdate,
    profession,
    quartier,
    departement,
    secteur,
    arrondissement,
    terms_accepted,
    resignation_commitment,
    belongs_to_party
  } = req.body;

  // 🔥 VALIDATION STRICTE — Tous les champs obligatoires
  if (
    !name ||
    !email ||
    !phone ||
    !birthdate ||
    !profession ||
    !quartier ||
    !departement ||
    !secteur ||
    !arrondissement ||
    terms_accepted !== true ||
    resignation_commitment !== true
  ) {
    return res.status(400).json({
      error: "Tous les champs sont obligatoires. Veuillez vérifier votre saisie."
    });
  }

  try {
    // Vérifier si email existe
    const check = await pool.query(
      `SELECT id FROM members WHERE email = $1`,
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        error: "Un membre avec cette adresse e-mail existe déjà."
      });
    }

    // INSÉRER LE MEMBRE
    const result = await pool.query(
      `
      INSERT INTO members (
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
        terms_accepted,
        resignation_commitment,
        belongs_to_party,
        status
      )
      VALUES (
        $1, $2, $3,
        'Standard',
        $4, $5, $6,
        $7, $8, $9,
        true, true,
        $10,
        'pending'
      )
      RETURNING *;
      `,
      [
        name,
        email,
        phone,
        departement,
        secteur,
        arrondissement,
        birthdate,
        profession,
        quartier,
        belongs_to_party === true ? true : false
      ]
    );

    const member = result.rows[0];

    // EMAIL DE CONFIRMATION (si configuré)
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Votre demande d'adhésion au FORDAC",
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Votre demande d'adhésion au <strong>FORDAC</strong> a été enregistrée avec succès.</p>
          <p>Votre dossier est actuellement en statut : <strong>EN ATTENTE DE VALIDATION</strong>.</p>
          
          ${
            belongs_to_party
              ? `<p>⚠️ Vous avez déclaré appartenir à un autre parti politique.</p>
                 <p>Comme indiqué, votre adhésion au FORDAC ne deviendra <strong>définitive</strong> qu’après transmission de votre lettre officielle de démission de votre ancien parti.</p>`
              : ""
          }

          <p>Vous recevrez une notification dès la validation de votre adhésion.</p>
          <p>Cordialement,<br>L’équipe FORDAC Connect</p>
        `
      });
    } catch (e) {
      console.error("Erreur envoi email :", e.message);
    }

    return res.status(201).json({
      message: "Adhésion enregistrée avec succès.",
      member
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du membre :", error);
    return res.status(500).json({
      error: "Erreur interne du serveur lors de l’enregistrement."
    });
  }
};

// =======================================================
//  PROFIL MEMBRE (déjà existant)
// =======================================================

exports.profile = async (req, res) => {
  try {
    const memberId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM members WHERE id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur profil :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
