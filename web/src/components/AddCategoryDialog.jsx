import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

const API_BASE = "http://localhost:4000";

export default function AddCategoryDialog({ open, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    emoji: "",
    color: "#1976d2",
  });
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.name || !form.emoji || !form.color) return alert("All fields required");
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        alert("Failed to add category");
        return;
      }
      onAdded && onAdded();
      onClose && onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Category</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label="Emoji"
          fullWidth
          margin="dense"
          value={form.emoji}
          onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
        />
        <TextField
          label="Color"
          type="color"
          fullWidth
          margin="dense"
          value={form.color}
          onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
          sx={{ width: 80, mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={saving}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
