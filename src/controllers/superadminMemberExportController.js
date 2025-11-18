const db = require("../db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// ======================================================
// UTILS : CHARGER LES MEMBRES (avec filtres)
// ======================================================
async function loadMembersWithFilters(req) {
  const { search = "", secteur = "", arrondissement = "" } = req.query;

  let query = `
      SELECT name, email, phone, quartier, secteur, arrondissement, membership_level, status, created_at
      FROM members
      WHERE 1=1
  `;
  
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }

  if (secteur) {
    params.push(secteur);
    query += ` AND secteur = $${params.length}`;
  }

  if (arrondissement) {
    params.push(arrondissement);
    query += ` AND arrondissement = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await db.query(query, params);
  return result.rows;
}

// ======================================================
// EXPORT EXCEL
// ======================================================
exports.exportExcel = async (req, res) => {
  try {
    const members = await loadMembersWithFilters(req);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Membres FORDAC");

    // Entêtes
    sheet.columns = [
      { header: "Nom", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Téléphone", key: "phone", width: 20 },
      { header: "Quartier", key: "quartier", width: 20 },
      { header: "Secteur", key: "secteur", width: 20 },
      { header: "Arrondissement", key: "arrondissement", width: 20 },
      { header: "Niveau", key: "membership_level", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Créé le", key: "created_at", width: 20 },
    ];

    // Données
    members.forEach((m) => {
      sheet.addRow({
        ...m,
        created_at: new Date(m.created_at).toLocaleString(),
      });
    });

    // Style entête
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=membres_fordac.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Erreur export Excel:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ======================================================
// EXPORT PDF
// ======================================================
exports.exportPdf = async (req, res) => {
  try {
    const members = await loadMembersWithFilters(req);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=membres_fordac.pdf");

    doc.pipe(res);

    // Titre
    doc
      .fontSize(20)
      .text("FORDAC — Liste des Membres", { align: "center" })
      .moveDown(2);

    // Tableau (simple et lisible)
    members.forEach((m) => {
      doc
        .fontSize(12)
        .text(`Nom : ${m.name}`)
        .text(`Téléphone : ${m.phone}`)
        .text(`Secteur : ${m.secteur}`)
        .text(`Arrondissement : ${m.arrondissement}`)
        .text(`Statut : ${m.status}`, { underline: false })
        .moveDown();
    });

    doc.end();

  } catch (err) {
    console.error("Erreur export PDF:", err);
    return res.status(500).json({ message: "Erreur export PDF" });
  }
};
