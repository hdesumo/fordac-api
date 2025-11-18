const db = require("../db");
const nodemailer = require("nodemailer");
const axios = require("axios");

/* ----------------------------- 1. SAUVEGARDE ----------------------------- */
async function saveMessage({ name, email, message }) {
  await pool.query(
    "INSERT INTO contact_messages (name, email, message) VALUES ($1,$2,$3)",
    [name, email, message]
  );
}

/* ------------------------------ 2. EMAILS -------------------------------- */
async function sendEmailNotification({ name, email, message }) {
  // ⚠ Configure ici le SMTP FORDAC
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io", // à remplacer
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"FORDAC CONTACT" <no-reply@fordac-connect.org>',
    to: "secretariat@fordac-connect.org", // destinataire réel
    subject: "📩 Nouveau message via FORDAC Connect",
    html: `
      <h2>Nouveau message reçu</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Message :</strong><br/>${message}</p>
    `,
  });
}

/* ---------------------------- 3. WHATSAPP -------------------------------- */
async function sendWhatsAppNotification({ name, email, message }) {
  if (!process.env.WHATSAPP_TOKEN) return;

  return axios.post(
    `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: process.env.WHATSAPP_ADMIN_NUMBER,
      type: "text",
      text: {
        body: `📩 Nouveau message FORDAC\n\n👤 ${name}\n📧 ${email}\n\n${message}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
    }
  );
}

/* ----------------------------- 4. TELEGRAM ------------------------------- */
async function sendTelegramNotification({ name, email, message }) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const text = `📩 <b>Nouveau message FORDAC</b>\n\n👤 ${name}\n📧 ${email}\n\n${message}`;

  return axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }
  );
}

/* -------------------------- 5. SERVICE GLOBAL ---------------------------- */
async function processContactMessage(data) {
  await saveMessage(data);
  await sendEmailNotification(data);
  await sendWhatsAppNotification(data);
  await sendTelegramNotification(data);
}

module.exports = { processContactMessage };
