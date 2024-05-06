/** BizTime express application. */
require("dotenv").config();
const express = require("express");
const app = express();
const ExpressError = require("./expressError");
const invoicesRoutes = require("./routes/invoices");

app.use(express.json());
app.use("/companies", require("./routes/companies"));
app.use("/invoices", invoicesRoutes);

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** General error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err,
    message: err.message,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = app;
