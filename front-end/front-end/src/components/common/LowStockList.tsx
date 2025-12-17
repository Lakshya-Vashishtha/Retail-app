import { Card, Typography, Box } from "@mui/material";

export default function LowStockList({ items }: { items: any[] }) {
  return (
    <Card sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" mb={2}>Low Stock Products</Typography>
      {items.length === 0 ? (
        <Typography>No low stock products</Typography>
      ) : (
        items.map((p: any) => (
          <Box key={p.id} sx={{ mb: 1 }}>
            <Typography>{p.name} — {p.quantity} left</Typography>
          </Box>
        ))
      )}
    </Card>
  );
}
