// routes/departmentRoutes.js
const express = require("express");
const router = express.Router();
const {
  setupDepartmentTable,
  addDepartmentAsset,
  getDepartmentAssets,
} = require("../controllers/departmentController");

// Route to create a department table
router.post("/setup", setupDepartmentTable);

// Generic routes for various departments
const departments = ["fireBrigade", "hospital", "police"];

departments.forEach((dept) => {
  // POST /api/departments/fireBrigade
  router.post(`/${dept}`, (req, res) => addDepartmentAsset(req, res, dept));

  // GET /api/departments/fireBrigade
  router.get(`/${dept}`, (req, res) => getDepartmentAssets(req, res, dept));
});

module.exports = router;
