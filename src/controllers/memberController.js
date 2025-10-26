import pool from "../config/db.js";
import transporter from "../config/mail.js";

// 🟩 1. Créer un nouveau membre + email automatique
export const createMember = async (req, res) => {
  const { name, email, phone, membership_level, region, departement, arrondissement } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Nom complet et téléphone requis." });
  }

  try {
    const query = `
      INSERT INTO members (name, email, phone, membership_level, region, departement, arrondissement)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [name, email, phone, membership_level, region, departement, arrondissement];
    const result = await pool.query(query, values);
    const newMember = result.rows[0];

    // 📨 Email de bienvenue
    if (email) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Bienvenue au FORDAC Connect !",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f7f7f7;color:#333">
            <h2 style="color:#0F3D2E">Bienvenue au FORDAC, ${name} !</h2>
            <p>Votre adhésion a bien été enregistrée.</p>
            <p>Niveau d’adhésion : <strong>${membership_level}</strong></p>
            <p>Région : <strong>${region}</strong></p>
            <hr style="margin:20px 0;border:none;border-top:1px solid #ccc"/>
            <p style="font-size:13px;color:#777">
              FORDAC Connect — Mouvement Citoyen pour un Cameroun Juste et Responsable
            </p>
          </div>
        `,
      });
    }

    // 📨 Copie interne
    if (process.env.MAIL_COORDINATION) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_COORDINATION,
        subject: `Nouvelle adhésion : ${name} (${membership_level})`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f4f4;color:#333">
            <h2 style="color:#0F3D2E">Nouvelle adhésion FORDAC</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Téléphone :</strong> ${phone}</p>
            <p><strong>Email :</strong> ${email || "non renseigné"}</p>
            <p><strong>Niveau :</strong> ${membership_level}</p>
            <p><strong>Région :</strong> ${region}</p>
            <p><strong>Département :</strong> ${departement || "-"}</p>
            <p><strong>Arrondissement :</strong> ${arrondissement || "-"}</p>
          </div>
        `,
      });
    }

    res.status(201).json({
      message: "Adhésion réussie et emails envoyés",
      member: newMember,
    });
  } catch (error) {
    console.error("Erreur création membre :", error);
    res.status(500).json({ error: "Erreur lors de la création du membre." });
  }
};

// 🟦 2. Lister tous les membres (admin)
export const listMembers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur récupération membres :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des membres." });
  }
};

// 🟨 3. Récupérer un membre par ID (admin)
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur récupération membre :", error);
    res.status(500).json({ error: "Erreur lors de la récupération du membre." });
  }
};
