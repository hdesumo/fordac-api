import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

pool.connect()
  .then(() => console.log("🗄️  Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

export default pool;
