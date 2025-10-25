import pool from "../config/db.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";

export const getSummary = async (req, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
    const byRole = await pool.query(
      "SELECT role, COUNT(*) FROM users GROUP BY role"
    );
    const membership = await pool.query(
      "SELECT name AS tier, COUNT(u.id) FROM membership_tiers m LEFT JOIN users u ON u.tier_id = m.id GROUP BY m.name"
    );

    res.json({
      total_users: totalUsers.rows[0].count,
      by_role: byRole.rows,
      membership_tiers: membership.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exportCSV = async (req, res) => {
  const filePath = "admin-report.csv";
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "field", title: "Field" },
      { id: "value", title: "Value" },
    ],
  });
  await csvWriter.writeRecords([
    { field: "Total Users", value: "1000+" },
    { field: "Superadmins", value: "1" },
  ]);
  res.download(filePath);
};

export const exportPDF = async (req, res) => {
  const filePath = "admin-report.pdf";
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(18).text("FORDAC CONNECT – Rapport Administratif Global", { align: "center" });
  doc.moveDown().fontSize(12).text("Forces Démocratiques pour l’Action et le Changement (FORDAC)");
  doc.moveDown().text("Résumé des statistiques et des adhésions...");
  doc.end();
  res.download(filePath);
};
