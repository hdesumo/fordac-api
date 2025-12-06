exports.activateMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    const result = await pool.query(
      "SELECT phone, email FROM members WHERE id = $1",
      [memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membre introuvable." });
    }

    const phone = result.rows[0].phone;

    // PIN = 4 derniers chiffres
    const tempPin = phone.slice(-4);
    const hashedPin = await bcrypt.hash(tempPin, 10);

    await pool.query(
      `UPDATE members 
       SET status='active', pin=$1, is_first_login=true 
       WHERE id=$2`,
      [hashedPin, memberId]
    );

    await sendActivationEmail(result.rows[0].email, tempPin);

    return res.json({
      success: true,
      message: "Membre activé",
      tempPin
    });

  } catch (err) {
    console.error("Erreur activateMember:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
