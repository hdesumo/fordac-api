const nodemailer = require("nodemailer");

// 🔧 Création du transport SMTP via Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * 📩 Fonction générique d'envoi d'email
 * @param {Object} param0
 * @returns boolean
 */
exports.sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,   // Exemple : "FORDAC Connect <info@fordac-connect.org>"
      to,
      subject,
      html,
    });

    console.log("📧 Email envoyé avec succès →", to);
    return true;

  } catch (err) {
    console.error("❌ Erreur lors de l’envoi du mail :", err.message);
    return false;
  }
};

/**
 * 📩 Email automatique pour le formulaire de contact
 */
exports.sendContactMail = async ({ name, email, subject, message }) => {
  const html = `
    <h2>📨 Nouveau message via le site FORDAC Connect</h2>

    <p><strong>Nom :</strong> ${name}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Sujet :</strong> ${subject}</p>
    <p><strong>Message :</strong><br>${message}</p>

    <hr />
    <p>FORDAC Connect - Message automatique</p>
  `;

  return exports.sendMail({
    to: process.env.MAIL_COORDINATION,   // ex: adhesions@fordac-connect.org
    subject: `Nouveau message - ${subject}`,
    html,
  });
};
