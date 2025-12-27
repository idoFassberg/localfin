import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
const COLOR_OPTIONS = [
  "#1976d2", // blue
  "#388e3c", // green
  "#fbc02d", // yellow
  "#d32f2f", // red
  "#7b1fa2", // purple
  "#ff9800", // orange
  "#607d8b", // blue grey
  "#9e9e9e", // grey
];

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
        <Box sx={{ mt: 2, mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {COLOR_OPTIONS.map((color) => (
              <IconButton
                key={color}
                size="small"
                sx={{
                  background: color,
                  border: form.color === color ? '2px solid #000' : '1px solid #ccc',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  p: 0,
                  transition: 'border 0.2s',
                }}
                onClick={() => setForm(f => ({ ...f, color }))}
              />
            ))}
            <TextField
              type="color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              sx={{ width: 40, minWidth: 40, p: 0, ml: 1, border: 'none', background: 'none' }}
              inputProps={{ style: { padding: 0, width: 32, height: 32, border: 'none', background: 'none' } }}
            />
          </Stack>
        </Box>
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
