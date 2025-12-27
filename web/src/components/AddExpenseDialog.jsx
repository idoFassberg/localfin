// Add expense from saved mode
async function handleAddFromSaved() {
  if (!selectedSavedId) return alert("Please select a saved expense");
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
    onAdded && onAdded();
    onClose && onClose();
  } finally {
    setSaving(false);
  }
}
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
  ToggleButton,
  ToggleButtonGroup,
  Box,
} from "@mui/material";

const API_BASE = "http://localhost:4000";

export default function AddExpenseDialog({ open, monthKey, onClose, onAdded }) {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("new");
  const [savedExpenses, setSavedExpenses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
    paidFor: "",
    note: "",
  });

  // load categories and users once
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((cats) => {
        setCategories(cats);
        setForm((f) => ({ ...f, category: cats[0] || "" }));
        console.log("Loaded categories:", cats);
      })
      .catch(() => setError("Failed to load categories"));

    fetch(`${API_BASE}/api/users`)
      .then((r) => r.json())
      .then((users) => {
        setUsers(users);
        setForm((f) => ({ ...f, paidFor: users[0]?.name || "" }));
      })
      .catch(() => setError("Failed to load users"));
  }, []);

  // default date when month changes
  useEffect(() => {
    if (monthKey) {
      setForm((f) => ({ ...f, date: `${monthKey}-01` }));
    }
  }, [monthKey]);

  // fetch saved expenses when dialog opens or mode changes to saved
  useEffect(() => {
    if (open && mode === "saved") {
      fetch(`${API_BASE}/api/saved-expenses`)
        .then((r) => r.json())
        .then(setSavedExpenses)
        .catch(() => setError("Failed to load saved expenses"));
    }
  }, [open, mode]);

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

  async function onSaveExpense() {
    if (!form.category || !form.paidFor)
      return alert("Category and Paid for are required");
    console.log("Saving expense:", form);
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/saved-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          paidfor: form.paidFor,
          note: form.note,
        }),
      });
      if (!r.ok) {
        alert("Failed to save expense");
        return;
      }
      onAdded && onAdded();
      onClose && onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: "relative", pr: 10 }}>
        {mode === "new" ? "Add expense" : "Saved expenses"}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          size="small"
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "background.paper",
            zIndex: 1,
          }}
        >
          <ToggleButton value="new">New</ToggleButton>
          <ToggleButton value="saved">Saved</ToggleButton>
        </ToggleButtonGroup>
      </DialogTitle>

      {mode === "new" ? (
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
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.2em" }}>{cat.emoji}</span>
                  {cat.name}
                </span>
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
            {users.map((u) => (
              <MenuItem key={u.id} value={u.name}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: u.color,
                      display: "inline-block",
                      border: "1px solid #888",
                    }}
                  />
                  {u.name}
                </span>
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
      ) : (
        <DialogContent>
          {error && <Typography color="error">{error}</Typography>}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pick a saved expense
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
            {savedExpenses.length === 0 ? (
              <Typography color="text.secondary">No saved expenses.</Typography>
            ) : (
              savedExpenses.map((se) => (
                <Box
                  key={se.id}
                  sx={{
                    border:
                      se.id === selectedSavedId
                        ? "2px solid #1976d2"
                        : "1px solid #ccc",
                    borderRadius: 2,
                    p: 1,
                    mb: 1,
                    cursor: "pointer",
                    bgcolor:
                      se.id === selectedSavedId
                        ? "#e3f2fd"
                        : "background.paper",
                  }}
                  onClick={() => {
                    setSelectedSavedId(se.id);
                    setForm((f) => ({
                      ...f,
                      category: se.category,
                      paidFor: se.paidfor,
                      note: se.note || "",
                    }));
                  }}
                >
                  <Typography>
                    <b>Category:</b> {se.category}
                  </Typography>
                  <Typography>
                    <b>Paid for:</b> {se.paidfor}
                  </Typography>
                  {se.note && (
                    <Typography>
                      <b>Note:</b> {se.note}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Box>
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
        </DialogContent>
      )}

      {/* Dialog actions: Save Expense button bottom left when mode is new */}
      <Box sx={{ position: "relative" }}>
        {mode === "new" && (
          <Box sx={{ position: "absolute", left: 16, bottom: 8 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onSaveExpense}
              disabled={saving}
            >
              Save Expense
            </Button>
          </Box>
        )}
        <DialogActions sx={{ justifyContent: "flex-end", pr: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={mode === "saved" ? handleAddFromSaved : onAdd}
            disabled={
              saving ||
              (mode === "new"
                ? mode !== "new"
                : !selectedSavedId || !form.amount || !form.date)
            }
          >
            Add
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
