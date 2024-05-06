const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get a list of all companies
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, name FROM companies");
    res.json({ companies: result.rows });
  } catch (err) {
    next(new ExpressError("Server Error. Coult not retrieve companies", 500));
  }
});

// Get details of a specific company by code
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      "SELECT code, name, description FROM companies WHERE code = $1",
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Create a new company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    next(new ExpressError("Server Error, Could not create a new company", 500));
  }
});

// Update a company's details by code
router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Delete a company by code
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING code",
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
