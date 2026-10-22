import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/", (req, res) => {
  res.json({ status: "Pages API is running" });
});

app.get("/pages", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, title, body, created_at FROM pages ORDER BY created_at DESC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/pages", async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const r = await pool.query(
      "INSERT INTO pages (title, body) VALUES ($1, $2) RETURNING id, title, body, created_at",
      [title, body || ""]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Pages API on port " + port));
