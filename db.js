require("dotenv").config();
const { Pool } = require("pg");

// Define a pool of connections
const pool = new Pool({
  user: process.env.DB_USER || "defaultUser",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "biztime_test",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
  console.log("Successfully connected to the database.");
});

pool.on("error", (err) => {
  console.error("Failed to connect to the database:", err);
});

module.exports = pool;
