// controllers/departmentController.js
const pool = require("../db"); // Assuming db.js is in the root

const setupDepartmentTable = async (req, res) => {
  try {
    const { dept } = req.body;
    if (!/^[a-zA-Z0-9_]+$/.test(dept)) {
      return res.status(400).json({ error: "Invalid department name." });
    }
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${dept}( id SERIAL PRIMARY KEY, name VARCHAR(100),location GEOGRAPHY(Point, 4326));`
    );
    res.status(201).json({
      message: `${dept} Table created successfully or already exists`,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to set up table for ${dept}` });
  }
};

const addDepartmentAsset = async (req, res, dept) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO ${dept} (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    res.status(201).json({ message: `${dept} asset added successfully` });
  } catch (error) {
    res.status(500).json({ error: `Failed to add ${dept} asset` });
  }
};

const getDepartmentAssets = async (req, res, dept) => {
  try {
    const data = await pool.query(
      `SELECT id, name, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM ${dept}`
    );
    res.status(200).json({ data: data.rows });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch ${dept} assets` });
  }
};

module.exports = {
  setupDepartmentTable,
  addDepartmentAsset,
  getDepartmentAssets,
};
