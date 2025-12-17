import { Dialog, DialogTitle, DialogContent, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function CSVUploadModal({ open, onClose, onUpload, submitting = false }: any) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Products CSV</DialogTitle>
      <DialogContent>
        <input
          type="file"
          accept=".csv"
          onChange={(e: any) => setFile(e.target.files[0])}
          style={{ marginTop: 20 }}
        />
        {file && <Typography sx={{ mt: 2 }}>{file.name}</Typography>}
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          disabled={!file || submitting}
          onClick={() => onUpload(file)}
        >
          {submitting ? "Uploading…" : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
