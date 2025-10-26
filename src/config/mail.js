import nodemailer from "nodemailer";

// ⚙️ Création du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou ton SMTP (Mailgun, Zoho, etc.)
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ Export par défaut pour compatibilité ES Modules
export default transporter;
