import { Card, Typography, Box } from "@mui/material";

export default function ExpiryAlertList({ items }: { items: any[] }) {
  return (
    <Card sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" mb={2}>Expiring Products</Typography>
      {items.length === 0 ? (
        <Typography>No near-expiry products</Typography>
      ) : (
        items.map((p: any) => (
          <Box key={p.id} sx={{ mb: 1 }}>
            <Typography>
              {p.name} — expires on {p.expiry_date}
            </Typography>
          </Box>
        ))
      )}
    </Card>
  );
}
