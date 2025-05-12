const express = require("express");
const pool = require("./db");

const port = 3000;
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes

app.get("/", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM schools`);
    return res.status(201).json({ data: data.rows });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});
app.post("/", async (req, res) => {
  const { name, location } = req.body;
  try {
    await pool.query(`INSERT INTO schools (name, address) VALUES ($1, $2)`, [
      name,
      location,
    ]);
    return res.status(201).json({ message: "child added successfully" });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

app.post("/setup", async (req, res) => {
  try {
    const { dept } = req.body;
    await pool.query(
      `CREATE TABLE ${dept}( id SERIAL PRIMARY KEY, name VARCHAR(100),location GEOGRAPHY(Point, 4326));`
    );
    return res
      .status(201)
      .json({ message: `${dept} Table created successfully` });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

app.post("/fireBrigade", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO firebrigade (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res
      .status(201)
      .json({ message: "fireBrigade station added successfully" });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

app.get("/fireBrigade", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM fireBrigade`);
    return res.status(201).json({ data: data.rows });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

const { findPlacesWithinRadius } = require("./controller/dist.js");
app.post("/find_dist", async (req, res) => {
  const { lat, lng, radius, dept } = req.body;
  try {
    const places = await findPlacesWithinRadius(lat, lng, radius, dept);
    return res.status(200).json({ data: places });
  } catch (error) {
    console.error("Error finding places within radius:", error);
    res.status(500).json({ error: "Failed to find places" });
  }
});

app.post("/hospital", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO hospital (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res
      .status(201)
      .json({ message: "fireBrigade station added successfully" });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

app.get("/hospital", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM hospital`);
    return res.status(201).json({ data: data.rows });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

app.post("/police", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO police (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res
      .status(201)
      .json({ message: "police station added successfully" });
  } catch (error) {
    console.error("Error setting up database:", error);
    res.status(500).json({ error: "Failed to set up database" });
  }
});

// NOTE: TRIAL
const { processTranscript } = require("./controller/process.js");
app.post("/emergency", processTranscript);
//

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
