import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Divider,
  Box,
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { CATEGORY_ICON } from "../constants/categoryIcons";

export default function ExpenseSummaryCard({ items = [] }) {
  const totalsByCategory = items.reduce((acc, e) => {
    const cat = e.category || "Other";
    const amount = Number(e.amount || 0);
    acc[cat] = (acc[cat] || 0) + amount;
    return acc;
  }, {});

  const entries = Object.entries(totalsByCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const monthTotal = entries.reduce((sum, x) => sum + x.total, 0);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            This month by category
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            ₪{monthTotal.toFixed(2)}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {entries.length === 0 ? (
          <Typography color="text.secondary">No expenses yet.</Typography>
        ) : (
          <>
            <Box sx={{ width: 260, mx: "auto", my: 2 }}>
              <PieChart
                series={[
                  {
                    data: entries.map(({ category, total }) => ({
                      id: category,
                      value: total,
                      label: category,
                      color: CATEGORY_ICON[category]?.color,
                    })),
                    // remove arcLabel
                    innerRadius: 60, // donut = modern
                    paddingAngle: 2,
                    cornerRadius: 6,
                  },
                ]}
                slotProps={{
                  legend: { hidden: true }, // hide the default legend
                }}
                width={260}
                height={260}
              />
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {entries.map(({ category, total }) => (
                <Box key={category}>
                  <Chip
                    label={`${category}  ₪${total.toFixed(2)}`}
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      background: CATEGORY_ICON[category]?.color || "#9e9e9e",
                      color: "#fff",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
