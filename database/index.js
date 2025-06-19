const { Pool } = require("pg");
require("dotenv").config();

// Log DATABASE_URL for debugging
console.log("DATABASE_URL:", process.env.DATABASE_URL || "Not set");

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render in all environments
  },
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error: error.message });
      throw error;
    }
  },
};