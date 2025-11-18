const pool = require("../db.js");
const mail = require("../services/mail.js");

exports.createAdhesion = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      birthdate,
      profession,
      quartier,
      secteur,
      arrondissement,
      membership_level
    } = req.body;

    // Vérification minimale
    if (!name || !email || !phone || !secteur || !arrondissement) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires."
      });
    }

    // Le département est fixe : Moungo
    const departement = "Moungo";

    const query = `
      INSERT INTO adhesions
      (name, email, phone, birthdate, profession, quartier, departement, secteur, arrondissement, membership_level)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const values = [
      name,
      email,
      phone,
      birthdate || null,
      profession || null,
      quartier || null,
      departement,
      secteur,
      arrondissement,
      membership_level || null
    ];

    const result = await pool.query(query, values);

    // --- Email interne FORDAC ---
    await mail.sendMail({
      to: process.env.MAIL_COORDINATION,
      subject: `Nouvelle adhésion - ${name}`,
      html: `
        <h2>Nouvelle adhésion reçue</h2>

        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>

        <p><strong>Département :</strong> Moungo</p>
        <p><strong>Secteur :</strong> ${secteur}</p>
        <p><strong>Arrondissement :</strong> ${arrondissement}</p>

        <p><strong>Profession :</strong> ${profession || "N/A"}</p>
        <p><strong>Quartier :</strong> ${quartier || "N/A"}</p>
        <p><strong>Date de naissance :</strong> ${birthdate || "N/A"}</p>

        <p><strong>Niveau d’adhésion :</strong> ${membership_level || "N/A"}</p>

        <hr />
        <p>FORDAC Connect - Nouveau membre enregistré</p>
      `
    });

    // --- Email de confirmation au membre ---
    await mail.sendMail({
      to: email,
      subject: "Votre adhésion au FORDAC Connect",
      html: `
        <h2>Bienvenue au FORDAC !</h2>
        <p>Bonjour ${name},</p>

        <p>Nous avons bien reçu votre demande d’adhésion.</p>
        <p>Elle sera examinée par notre bureau dans les plus brefs délais.</p>

        <p>Cordialement,<br>FORDAC Connect</p>
      `
    });

    res.status(201).json({
      message: "Adhésion enregistrée avec succès.",
      adhesion: result.rows[0]
    });

  } catch (error) {
    console.error("Erreur createAdhesion:", error.message);
    res.status(500).json({
      message: "Une erreur est survenue lors de l’enregistrement."
    });
  }
};
