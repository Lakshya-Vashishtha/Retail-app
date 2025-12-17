import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";

export default function SaleFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  products
}: any) {

  const [form, setForm] = useState({
    product_id: "",
    quantity_sold: "",
    sale_date: "",
    total_price: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    // Auto-update total price
    if (e.target.name === "product_id" || e.target.name === "quantity_sold") {
      const product = products.find((p: any) => p.id == updated.product_id);
      if (product && updated.quantity_sold) {
        updated.total_price = Number(product.price) * Number(updated.quantity_sold);
      }
    }

    setForm(updated);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Sale" : "Record Sale"}</DialogTitle>
      <DialogContent>

        <TextField
          select fullWidth margin="normal"
          label="Product" name="product_id"
          value={form.product_id} onChange={handleChange}
        >
          {products.map((p: any) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth margin="normal" type="number"
          label="Quantity Sold" name="quantity_sold"
          value={form.quantity_sold} onChange={handleChange}
        />

        <TextField
          fullWidth margin="normal" type="date"
          label="Sale Date" name="sale_date"
          InputLabelProps={{ shrink: true }}
          value={form.sale_date} onChange={handleChange}
        />

        <TextField
          fullWidth margin="normal"
          label="Total Price" name="total_price"
          value={String(form.total_price)} disabled
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={() => onSubmit(form)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
