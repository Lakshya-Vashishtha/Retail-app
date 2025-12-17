import { useState } from "react";
import { Card, TextField, Button, Typography, Box } from "@mui/material";
import api from "../api/axiosConfig";
import { useAuth } from "../app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/", form);
      login(res.data.access_token);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f1f5f9"
    >
      <Card sx={{ p: 4, width: 400, borderRadius: 4 }}>
        <Typography variant="h5" mb={2}>
          Login
        </Typography>
        <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange} />
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          margin="normal"
          onChange={handleChange}
        />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Logging in6" : "Login"}
        </Button>
        <Button fullWidth href="/register" sx={{ mt: 1 }}>
          Create an account
        </Button>
      </Card>
    </Box>
  );
}
