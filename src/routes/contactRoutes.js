const express = require("express");
const router = express.Router();
const { processContactMessage } = require("../services/contactService");

router.post("/send", async (req, res) => {
  try {
    const data = req.body;

    // reCAPTCHA v3
    const rc = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${data.recaptchaToken}`,
      { method: "POST" }
    ).then((r) => r.json());

    if (!rc.success || rc.score < 0.5) {
      return res.status(400).json({ error: "Captcha invalide" });
    }

    await processContactMessage(data);

    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur contact:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
