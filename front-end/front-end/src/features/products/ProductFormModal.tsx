import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useState, useEffect } from "react";

export default function ProductFormModal({ open, onClose, onSubmit, initialData, submitting = false }: any) {
  const [form, setForm] = useState({
    name: "",
    Brand: "",
    category: "",
    price: "",
    cost_price: "",
    quantity: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData as any);
    } else {
      setForm({ name: "", Brand: "", category: "", price: "", cost_price: "", quantity: "", expiry_date: "" });
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Product" : "Add Product"}</DialogTitle>
      <DialogContent>
        <TextField fullWidth margin="normal" label="Name" name="name" value={form.name} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Brand" name="Brand" value={form.Brand} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Category" name="category" value={form.category} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Price" name="price" type="number" value={form.price} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Cost Price" name="cost_price" type="number" value={form.cost_price} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Expiry Date" name="expiry_date" type="date" InputLabelProps={{ shrink: true }} value={form.expiry_date} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={() => onSubmit(form)} disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
