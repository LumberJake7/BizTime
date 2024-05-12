// industries.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Add industry
router.post("/", async (req, res, next) => {
  const { code, industry } = req.body;
  const result = await db.query(
    "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
    [code, industry]
  );
  res.status(201).json({ industry: result.rows[0] });
});

// List all industries
router.get("/", async (req, res, next) => {
  const result = await db.query(`
      SELECT i.code, i.industry, array_agg(c.code) as company_codes
      FROM industries i
      JOIN company_industries ci ON i.code = ci.industry_code
      JOIN companies c ON ci.company_code = c.code
      GROUP BY i.code
    `);
  res.json({ industries: result.rows });
});
// Associate an industry to a company
router.post("/associate", async (req, res, next) => {
  const { company_code, industry_code } = req.body;
  const result = await db.query(
    "INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)",
    [company_code, industry_code]
  );
  res.status(201).send("Association created successfully");
});

module.exports = router;
