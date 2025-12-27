import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddExpenseDialog from "../components/AddExpenseDialog";
import ExpenseSummaryCard from "../components/ExpenseSummaryCard";
import { useEffect as useEffectUsers } from "react";
import { CATEGORY_ICON } from "../constants/categoryIcons";
import AddCategoryDialog from "../components/AddCategoryDialog";

const API_BASE = "http://localhost:4000";
const PAID_FOR = ["ido", "yuli", "both"];

function formatDate(isoDate) {
  // isoDate: YYYY-MM-DD
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export default function MonthPage({ monthKey }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editId, setEditId] = useState(null); // for future edit dialog

  useEffect(() => {
    if (!monthKey) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/expenses?month=${encodeURIComponent(monthKey)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load expenses");
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [monthKey]);

  const [users, setUsers] = useState([]);
  useEffectUsers(() => {
    fetch(`${API_BASE}/api/users`)
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  const userExpenses = users.map((user) => ({
    user,
    items: items.filter((e) => e.paid_for === user.name),
  }));

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
    setItems((items) => items.filter((e) => e.id !== id));
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      ></Stack>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">Error: {error}</Typography>}
      {!loading && !error && items.length === 0 && (
        <Typography color="text.secondary">No expenses this month.</Typography>
      )}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <ExpenseSummaryCard items={items} title="All Users" />
        {userExpenses.map(({ user, items }) => (
          <ExpenseSummaryCard
            key={user.id}
            items={items}
            title={user.name}
            color={user.color}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setAddOpen(true)}>
          Add expense
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => setAddCategoryOpen(true)}>
          Add category
        </Button>
      </Stack>
      <AddExpenseDialog
        open={addOpen}
        monthKey={monthKey}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setLoading(true);
          fetch(`${API_BASE}/expenses?month=${encodeURIComponent(monthKey)}`)
            .then((r) => r.json())
            .then(setItems)
            .finally(() => setLoading(false));
        }}
      />
      <AddCategoryDialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
      />

      <Stack
        direction="row"
        spacing={3}
        alignItems="flex-start"
        sx={{ overflowX: "auto", mt: 3 }}
      >
        {userExpenses.map(({ user, items }) => (
          <Box key={user.id} sx={{ minWidth: 500, maxWidth: 700 }}>
            <Typography variant="h6" sx={{ mb: 1, color: user.color }}>
              {user.name}
            </Typography>
            <Stack spacing={1.5}>
              {items.length === 0 ? (
                <Typography color="text.secondary">No expenses.</Typography>
              ) : (
                items.map((e) => (
                  <Card
                    key={e.id}
                    variant="outlined"
                    sx={{ maxWidth: 700, minWidth: 500, width: "100%" }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack spacing={0.5}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip
                              label={
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <span style={{ fontSize: "1.2em" }}>
                                    {CATEGORY_ICON[e.category]?.icon || "🧾"}
                                  </span>
                                  {e.category}
                                </span>
                              }
                              sx={{
                                backgroundColor:
                                  CATEGORY_ICON[e.category]?.color || "#9e9e9e",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1em",
                                px: 1.2,
                                py: 0.5,
                                ".MuiChip-label": {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                },
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(e.date)}
                            </Typography>
                          </Stack>

                          {e.note ? (
                            <Typography variant="body2" color="text.secondary">
                              {e.note}
                            </Typography>
                          ) : null}
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {Number(e.amount)} ₪
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(e.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setEditId(e.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Divider sx={{ mt: 1.25, opacity: 0.4 }} />
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
