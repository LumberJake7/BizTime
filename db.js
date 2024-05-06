/** Database setup for BizTime. */
require("dotenv").config();
const { Client } = require("pg");

const DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

let db = new Client({
  connectionString: DB_URI,
});

db.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Successfully connected to the database.");
  }
});

module.exports = db;
