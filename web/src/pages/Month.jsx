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
} from "@mui/material";
import AddExpenseDialog from "../components/AddExpenseDialog";

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

  const total = useMemo(
    () => items.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [items]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          ₪{total.toFixed(2)}
        </Typography>
      </Stack>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">Error: {error}</Typography>}
      {!loading && !error && items.length === 0 && (
        <Typography color="text.secondary">No expenses this month.</Typography>
      )}
      <Button variant="contained" onClick={() => setAddOpen(true)}>
        Add expense
      </Button>
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
    
      <Stack spacing={1.5}>
        {items.map((e) => (
          <Card key={e.id} variant="outlined">
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 700 }}>
                      {e.category}
                    </Typography>
                    <Chip size="small" label={e.paid_for} />
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

                <Typography sx={{ fontWeight: 800 }}>
                  ₪{Number(e.amount).toFixed(2)}
                </Typography>
              </Stack>

              <Divider sx={{ mt: 1.25, opacity: 0.4 }} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
