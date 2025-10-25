// src/controllers/locationsController.js
import pool from "../db.js";

export const getRegions = async (req, res) => {
  try {
    const q = await pool.query("SELECT id, name FROM regions ORDER BY name");
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDepartements = async (req, res) => {
  const { regionId } = req.params;
  try {
    const q = await pool.query("SELECT id, name FROM departements WHERE region_id=$1 ORDER BY name", [regionId]);
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getZones = async (req, res) => {
  const { departementId } = req.params;
  try {
    const q = await pool.query("SELECT id, name FROM zones WHERE departement_id=$1 ORDER BY name", [departementId]);
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getArrondissements = async (req, res) => {
  const { zoneId } = req.params;
  try {
    const q = await pool.query("SELECT id, name FROM arrondissements WHERE zone_id=$1 ORDER BY name", [zoneId]);
    res.json(q.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
