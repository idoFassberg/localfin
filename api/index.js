const express = require("express");
const cors = require("cors");
const db = require("./db");
const { CATEGORIES, PAID_FOR } = require("./constants");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/categories", (req, res) => {
  res.json(CATEGORIES);
});

app.post("/expenses", (req, res) => {
  const { date, amount, paidFor, category, note = "" } = req.body;

  if (!date || typeof amount !== "number" || !PAID_FOR.includes(paidFor) || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const stmt = db.prepare(`
    INSERT INTO expenses (date, amount, paid_for, category, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(date, amount, paidFor, category, note);
  res.json({ id: info.lastInsertRowid });
});

app.get("/expenses", (req, res) => {
  const rows = db
    .prepare(`SELECT * FROM expenses ORDER BY date DESC, id DESC`)
    .all();

  res.json(rows);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
