router.get("/notifications-count", memberMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT COUNT(*) FROM member_notifications WHERE member_id = $1 AND is_read = false",
      [req.member.id]
    );

    return res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    return res.status(500).json({ message: "Erreur interne." });
  }
});
