import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productsAPI } from "../api/products";
import { Box, Button, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import ProductFormModal from "../features/products/ProductFormModal";
import CSVUploadModal from "../features/products/CSVUploadModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { toast } from "react-toastify";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: productsAPI.getAll });

  const [modalOpen, setModalOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  if (productsQuery.isLoading) return <div>Loading...</div>;

  const rows = productsQuery.data?.data || [];

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "Brand", headerName: "Brand", width: 120 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "price", headerName: "Price", width: 120 },
    { field: "cost_price", headerName: "Cost Price", width: 120 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    { field: "expiry_date", headerName: "Expiry Date", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params: any) => (
        <Box>
          <Button size="small" onClick={() => startEdit(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </Box>
      ),
    },
  ];

  const startEdit = (row: any) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (editing) {
        await productsAPI.update(editing.id, data);
        toast.success("Product updated successfully!");
      } else {
        await productsAPI.create(data);
        toast.success("Product added successfully!");
      }
      setModalOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: number) => {
    const delId = id ?? toDeleteId;
    if (!delId) return;
    try {
      await productsAPI.remove(delId);
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Delete failed");
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleCSV = async (file: File) => {
    try {
      setSubmitting(true);
      await productsAPI.uploadCSV(file);
      toast.success("CSV uploaded successfully!");
      setCsvOpen(false);
      queryClient.invalidateQueries(["products"]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "CSV upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" sx={{ mr: 2 }} onClick={() => setModalOpen(true)} disabled={submitting}>
          Add Product
        </Button>
        <Button variant="outlined" onClick={() => setCsvOpen(true)} disabled={submitting}>
          Upload CSV
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} columns={columns} autoHeight />
      </Paper>

      <ProductFormModal
        open={modalOpen}
        initialData={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <CSVUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onUpload={handleCSV}
        submitting={submitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product"
        message="Are you sure you want to delete this product?"
        onConfirm={() => handleDelete()}
        onClose={() => { setConfirmOpen(false); setToDeleteId(null); }}
      />
    </Box>
  );
}
