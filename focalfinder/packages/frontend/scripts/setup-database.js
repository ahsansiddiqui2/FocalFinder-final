const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log("Setting up database schema...")

    // Read and execute schema file
    const schemaSQL = fs.readFileSync(path.join(__dirname, "01-create-database-schema.sql"), "utf8")
    await pool.query(schemaSQL)

    console.log("Database schema created successfully!")

    // Read and execute seed file
    const seedSQL = fs.readFileSync(path.join(__dirname, "02-seed-sample-data.sql"), "utf8")
    await pool.query(seedSQL)

    console.log("Sample data seeded successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await pool.end()
  }
}

setupDatabase()
