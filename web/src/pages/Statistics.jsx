import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { CATEGORY_ICON } from "../constants/categoryIcons";

const API_BASE = "http://localhost:4000";

function toMonthKey(dateStr) {
  // dateStr: YYYY-MM-DD
  return typeof dateStr === "string" && dateStr.length >= 7
    ? dateStr.slice(0, 7)
    : null;
}

export default function Statistics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // NOTE: your API routes are /expenses (not /api/expenses)
    fetch(`${API_BASE}/expenses`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load expenses");
        return r.json();
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { months, series } = useMemo(() => {
    // month -> category -> total
    const monthSet = new Set();
    const catSet = new Set();
    const totals = {}; // { [cat]: { [month]: number } }

    for (const e of items) {
      const month = toMonthKey(e.date);
      if (!month) continue;

      const cat = e.category || "Other";
      const amt = Number(e.amount);

      if (!Number.isFinite(amt)) continue;

      monthSet.add(month);
      catSet.add(cat);

      if (!totals[cat]) totals[cat] = {};
      totals[cat][month] = (totals[cat][month] ?? 0) + amt;
    }

    const monthsSorted = Array.from(monthSet).sort(); // YYYY-MM sorts correctly
    const catsSorted = Array.from(catSet).sort();

    const chartSeries = catsSorted.map((cat) => ({
      label: cat,
      data: monthsSorted.map((m) => Number(totals[cat]?.[m] ?? 0)), // <-- missing month/category => 0
      color: CATEGORY_ICON[cat]?.color,
    }));

    return { months: monthsSorted, series: chartSeries };
  }, [items]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : months.length === 0 ? (
        <Typography color="text.secondary">No expenses yet.</Typography>
      ) : (
        <LineChart
          xAxis={[{ data: months, scaleType: "band", label: "Month" }]}
          series={series}
          height={420}
          margin={{ left: 60, right: 30, top: 40, bottom: 40 }}
        />
      )}
    </Box>
  );
}
