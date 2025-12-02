const pool = require("../config/db");
const transporter = require("../config/mailer");

// =======================================================
//  CRÉATION D’UN MEMBRE (ADHÉSION VIA LA VITRINE)
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
    resignation_commitment
  } = req.body;

  // 🔥 VALIDATION STRICTE — Tous les champs sont obligatoires
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
    // Vérifier si email déjà utilisé
    const check = await pool.query(
      `SELECT id FROM members WHERE email = $1`,
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        error: "Un membre avec cette adresse e-mail existe déjà."
      });
    }

    // 🌱 INSÉRER LE MEMBRE DANS LA BASE
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
        status
      )
      VALUES (
        $1, $2, $3,
        'Standard',
        $4, $5, $6,
        $7, $8, $9,
        true, true,
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
        quartier
      ]
    );

    const member = result.rows[0];

    // 📩 ENVOYER EMAIL CONFIRMATION (si configuré)
    if (process.env.MAIL_FROM) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: email,
          subject: "Votre demande d'adhésion au FORDAC",
          html: `
            <h2>Bonjour ${name},</h2>
            <p>Nous accusons réception de votre demande d'adhésion au FORDAC.</p>
            <p>Votre dossier est maintenant en statut : <strong>EN ATTENTE DE VALIDATION</strong>.</p>
            <p>Vous serez contacté dès validation.</p>
            <p>Cordialement,<br>L’équipe FORDAC Connect</p>
          `
        });
      } catch (e) {
        console.error("Erreur envoi email :", e.message);
      }
    }

    // Réponse finale
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
//  PROFIL MEMBRE (existe déjà chez toi)
// =======================================================

exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur récupération profil :", error);
    return res.status(500).json({ error: "Erreur interne." });
  }
};
