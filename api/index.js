const express = require("express");
const cors = require("cors");
const db = require("./db");
const { CATEGORIES, PAID_FOR } = require("./constants");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/expenses/range", (req, res) => {
  const row = db
    .prepare(`SELECT MIN(date) AS minDate, MAX(date) AS maxDate FROM expenses`)
    .get();

  // if table empty => both null
  res.json({ minDate: row?.minDate ?? null, maxDate: row?.maxDate ?? null });
});


app.post("/expenses", (req, res) => {
  const { date, amount, paidFor, category, note = "" } = req.body;

  // Validate user exists
  const user = db.prepare('SELECT * FROM users WHERE name = ?').get(paidFor);
  if (!date || typeof amount !== "number" || !user) {
    return res.status(400).json({ error: "Invalid input or user does not exist" });
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

app.post("/api/users", (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) {
    return res.status(400).json({ error: "Name and color are required" });
  }
  const stmt = db.prepare(`INSERT INTO users (name, color) VALUES (?, ?)`);
  const info = stmt.run(name, color);
  res.json({ id: info.lastInsertRowid });
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY id DESC").all();
  res.json(users);
});

app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json({ ok: true });
});

app.put('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { date, amount, paidFor, category, note = "" } = req.body;
  // Validate user exists
  const user = db.prepare('SELECT * FROM users WHERE name = ?').get(paidFor);
  if (!date || typeof amount !== "number" || !user || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid input or user does not exist" });
  }
  const info = db.prepare(`
    UPDATE expenses SET date = ?, amount = ?, paid_for = ?, category = ?, note = ? WHERE id = ?
  `).run(date, amount, paidFor, category, note, id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json({ ok: true });
});

// Add a new saved expense
app.post("/api/saved-expenses", (req, res) => {
  const { category, paidfor, note = "" } = req.body;
  if (!category || !paidfor) {
    return res.status(400).json({ error: "Category and paidfor are required" });
  }
  const stmt = db.prepare(`
    INSERT INTO saved_expenses (category, paidfor, note)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(category, paidfor, note);
  res.json({ id: info.lastInsertRowid });
});
// Get all saved expenses
app.get("/api/saved-expenses", (req, res) => {
  const rows = db.prepare("SELECT * FROM saved_expenses ORDER BY id DESC").all();
  // For each saved expense, find the emoji from the categories table
  const withEmoji = rows.map((row) => {
    const cat = db.prepare("SELECT emoji FROM categories WHERE name = ?").get(row.category);
    return { ...row, emoji: cat ? cat.emoji : "" };
  });
  res.json(withEmoji);
});

// Delete a saved expense
app.delete("/api/saved-expenses/:id", (req, res) => {
  const { id } = req.params;
  const info = db.prepare("DELETE FROM saved_expenses WHERE id = ?").run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: "Saved expense not found" });
  }
  res.json({ ok: true });
});

// ------------------ Category CRUD endpoints ------------------
// Get all categories
app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY id DESC").all();
  res.json(rows);
});

// Add a new category
app.post("/api/categories", (req, res) => {
  const { name, emoji, color } = req.body;
  if (!name || !emoji || !color) {
    return res.status(400).json({ error: "Name, emoji, and color are required" });
  }
  const stmt = db.prepare(`INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?)`);
  const info = stmt.run(name, emoji, color);
  res.json({ id: info.lastInsertRowid });
});

// Update a category
app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, emoji, color } = req.body;
  if (!name || !emoji || !color) {
    return res.status(400).json({ error: "Name, emoji, and color are required" });
  }
  const info = db.prepare(`UPDATE categories SET name = ?, emoji = ?, color = ? WHERE id = ?`).run(name, emoji, color, id);
  if (info.changes === 0) {
    return res.status(404).json({ error: "Category not found" });
  }
  res.json({ ok: true });
});

// Delete a category
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error("[UNHANDLED]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
