import { useQuery, useQueryClient } from "@tanstack/react-query";
import { salesAPI } from "../api/sales";
import { productsAPI } from "../api/products";
import { Box, Button, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import SaleFormModal from "../features/sales/SaleFormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { toast } from "react-toastify";

export default function SalesPage() {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({ queryKey: ["sales"], queryFn: salesAPI.getAll });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: productsAPI.getAll });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  if (salesQuery.isLoading || productsQuery.isLoading) return <div>Loading...</div>;

  const sales = salesQuery.data?.data || [];
  const products = productsQuery.data?.data || [];

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "product_id",
      headerName: "Product",
      width: 150,
      valueGetter: (params: any) => {
        const product = products.find((p: any) => p.id === params.value);
        return product ? product.name : "Unknown";
      }
    },
    { field: "quantity_sold", headerName: "Qty Sold", width: 120 },
    { field: "sale_date", headerName: "Sale Date", width: 150 },
    { field: "total_price", headerName: "Total Price", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params: any) => (
          <Box>
            <Button size="small" onClick={() => startEdit(params.row)}>
              Edit
            </Button>

            <Button
              size="small"
              color="error"
              onClick={() => { setToDeleteId(params.row.id); setConfirmOpen(true); }}
            >
              Delete
            </Button>
          </Box>
        )
    }
  ];

  const startEdit = (row: any) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (editing) {
        await salesAPI.update(editing.id, data);
        toast.success("Sale updated successfully!");
      } else {
        await salesAPI.create(data);
        toast.success("Sale recorded successfully!");
      }
      setModalOpen(false);
      setEditing(null);
      queryClient.invalidateQueries(["sales"]);
      queryClient.invalidateQueries(["products"]); // because stock changes
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
      await salesAPI.remove(delId);
      toast.success("Sale deleted");
      queryClient.invalidateQueries(["sales"]);
      queryClient.invalidateQueries(["products"]); // restore stock
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Delete failed");
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" sx={{ mr: 2 }} onClick={() => setModalOpen(true)} disabled={submitting}>
          Record Sale
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <DataGrid rows={sales} columns={columns} autoHeight />
      </Paper>

      <SaleFormModal
        open={modalOpen}
        initialData={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        products={products}
        submitting={submitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete sale"
        message="Are you sure you want to delete this sale?"
        onConfirm={() => handleDelete()}
        onClose={() => { setConfirmOpen(false); setToDeleteId(null); }}
      />
    </Box>
  );
}
