require('dotenv').config();
const bcrypt = require("bcryptjs");
const pool = require("../src/db");

async function fixPins() {
  const members = await pool.query(
    "SELECT id, phone FROM members WHERE status='active'"
  );

  for (let m of members.rows) {
    const phone = m.phone.replace(/\D/g, ""); // enlève + et trucs
    const rawPin = phone.slice(-4);
    const hashedPin = await bcrypt.hash(rawPin, 10);

    await pool.query(
      "UPDATE members SET pin=$1 WHERE id=$2",
      [hashedPin, m.id]
    );

    console.log(`✔ PIN corrigé pour membre ${m.id} → ${rawPin}`);
  }

  process.exit();
}

fixPins();
