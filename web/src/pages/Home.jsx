import { useEffect, useMemo, useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import Month from "./Month.jsx";

const API_BASE = "http://localhost:4000";

function parseISODate(dateStr) {
  // dateStr: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // YYYY-MM
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function buildMonthRange(minDateStr, maxDateStr) {
  const start = parseISODate(minDateStr);
  const end = parseISODate(maxDateStr);

  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= last) {
    months.push(monthKey(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  // show newest first in tabs
  return months.reverse();
}

export default function Home() {
  const [range, setRange] = useState({ minDate: null, maxDate: null });
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/expenses/range`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load expenses range");
        return r.json();
      })
      .then(setRange)
      .catch((e) => setError(e.message));
  }, []);

  const months = useMemo(() => {
    if (!range.minDate || !range.maxDate) return [];
    return buildMonthRange(range.minDate, range.maxDate);
  }, [range]);

  const selectedMonthKey = months[tabIndex] || null;

  if (error) return <div>Error: {error}</div>;
  if (!range.minDate) return <div>No expenses yet.</div>;
  if (!months.length) return <div>Loading...</div>;

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(e, v) => setTabIndex(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {months.map((k) => (
          <Tab key={k} label={monthLabel(k)} />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        <Month monthKey={selectedMonthKey} />
      </Box>
    </Box>
  );
}
