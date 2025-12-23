const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "localfin.sqlite"));

// simple schema — safe to run every start
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    paid_for TEXT NOT NULL,
    category TEXT NOT NULL,
    note TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
`);

module.exports = db;
