const express = require("express");
const cors = require("cors");
const db = require("./db");
const { CATEGORIES, PAID_FOR } = require("./constants");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/categories", (req, res) => {
  res.json(CATEGORIES);
});

app.get("/api/expenses/range", (req, res) => {
  const row = db
    .prepare(`SELECT MIN(date) AS minDate, MAX(date) AS maxDate FROM expenses`)
    .get();

  // if table empty => both null
  res.json({ minDate: row?.minDate ?? null, maxDate: row?.maxDate ?? null });
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
  const { month } = req.query; // "YYYY-MM"

  let rows;
  if (month) {
    rows = db
      .prepare(
        `SELECT * FROM expenses
         WHERE date LIKE ?
         ORDER BY date DESC, id DESC`
      )
      .all(`${month}-%`);
  } else {
    rows = db
      .prepare(`SELECT * FROM expenses ORDER BY date DESC, id DESC`)
      .all();
  }

  res.json(rows);
});

app.use((err, req, res, next) => {
  console.error("[UNHANDLED]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
