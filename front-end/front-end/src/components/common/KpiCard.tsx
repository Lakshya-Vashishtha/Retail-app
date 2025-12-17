import { Card, Typography } from "@mui/material";

export default function KpiCard({ title, value }: { title: string; value: any }) {
  return (
    <Card sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" fontWeight={600}>{value}</Typography>
    </Card>
  );
}
