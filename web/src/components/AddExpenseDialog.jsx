import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

const API_BASE = "http://localhost:4000";
const PAID_FOR = ["ido", "yuli", "both"];

export default function AddExpenseDialog({ open, monthKey, onClose, onAdded }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
    paidFor: "both",
    note: "",
  });

  // load categories once
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((cats) => {
        setCategories(cats);
        setForm((f) => ({ ...f, category: cats[0] || "" }));
      })
      .catch(() => setError("Failed to load categories"));
  }, []);

  // default date when month changes
  useEffect(() => {
    if (monthKey) {
      setForm((f) => ({ ...f, date: `${monthKey}-01` }));
    }
  }, [monthKey]);

  async function onAdd() {
    const amountNum = Number(form.amount);
    if (!form.date || amountNum <= 0) return alert("Invalid input");

    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          amount: amountNum,
          category: form.category,
          paidFor: form.paidFor,
          note: form.note,
        }),
      });

      if (!r.ok) {
        alert("Failed to add expense");
        return;
      }

      onAdded(); // tell parent to refresh
      onClose(); // close dialog
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add expense</DialogTitle>

      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}

        <TextField
          type="date"
          label="Date"
          fullWidth
          margin="dense"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="dense"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <TextField
          select
          label="Category"
          fullWidth
          margin="dense"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Paid for"
          fullWidth
          margin="dense"
          value={form.paidFor}
          onChange={(e) => setForm({ ...form, paidFor: e.target.value })}
        >
          {PAID_FOR.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Note"
          fullWidth
          margin="dense"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onAdd} disabled={saving}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
