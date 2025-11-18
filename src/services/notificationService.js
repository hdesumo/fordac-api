const pool = require("../config/db");
const adminTemplates = require("./notificationTemplates");

// ===============================
//  🔔 1. NOTIFICATION À UN ADMIN
// ===============================
async function createNotification(admin_id, notif) {
  try {
    await pool.query(
      `
      INSERT INTO admin_notifications (admin_id, type, title, message, link)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [admin_id, notif.type, notif.title, notif.message, notif.link || null]
    );
  } catch (error) {
    console.error("Erreur createNotification:", error);
  }
}

// ===============================
//  🔔 2. NOTIFICATION À TOUS LES ADMINS
// ===============================
async function createNotificationForAllAdmins(notif) {
  try {
    const admins = await pool.query(`SELECT id FROM admins`);

    for (const admin of admins.rows) {
      await createNotification(admin.id, notif);
    }
  } catch (error) {
    console.error("Erreur createNotificationForAllAdmins:", error);
  }
}

// ===============================
//  🔔 3. UTILITAIRE SIMPLIFIÉ
// ===============================
async function notifyAdmin(admin_id, type, title, message, link = null) {
  return createNotification(admin_id, { type, title, message, link });
}

// ===============================
//  🔔 4. TEMPLATES PRÉ-DÉFINIS
// ===============================
async function notifyWithTemplate(admin_id, templateName, variables = {}) {
  const template = adminTemplates[templateName];
  if (!template) {
    console.error("Template introuvable:", templateName);
    return;
  }

  const notif = {
    type: template.type,
    title: replaceVars(template.title, variables),
    message: replaceVars(template.message, variables),
    link: template.link ? replaceVars(template.link, variables) : null,
  };

  return createNotification(admin_id, notif);
}

// Remplacement {{variable}}
function replaceVars(text, vars) {
  let output = text;
  for (const key in vars) {
    output = output.replace(new RegExp(`{{${key}}}`, "g"), vars[key]);
  }
  return output;
}

module.exports = {
  createNotification,
  createNotificationForAllAdmins,
  notifyAdmin,
  notifyWithTemplate,
};
