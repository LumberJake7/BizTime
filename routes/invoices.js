const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get a list of all invoices
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    res.json({ invoices: result.rows });
  } catch (err) {
    next(new ExpressError("Could not retrieve invoices", 500));
  }
});

// Get details of a specific invoice by ID, including company details
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `
        SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
        FROM invoices AS i
        JOIN companies AS c ON i.comp_code = c.code
        WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }
    const invoice = result.rows[0];
    invoice.company = {
      code: invoice.code,
      name: invoice.name,
      description: invoice.description,
    };
    delete invoice.code;
    delete invoice.name;
    delete invoice.description;

    res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

// Create a new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    next(new ExpressError("Could not create invoice", 500));
  }
});

// Update an invoice by ID
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    const currentData = await db.query(
      "SELECT paid, paid_date FROM invoices WHERE id = $1",
      [id]
    );

    if (currentData.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    const invoice = currentData.rows[0];
    let paidDate = invoice.paid_date;

    if (paid && !invoice.paid) {
      paidDate = new Date();
    } else if (!paid && invoice.paid) {
      paidDate = null;
    }

    const result = await db.query(
      "UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, paid, paidDate, id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404); // This line is theoretically redundant due to earlier checks
    }

    res.json({ invoice: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Delete an invoice by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }
    res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
