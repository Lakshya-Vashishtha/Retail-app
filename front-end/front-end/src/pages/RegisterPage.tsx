import { useState } from "react";
import { Card, TextField, Button, Typography, Box } from "@mui/material";
import api from "../api/axiosConfig";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/auth/SignUp", form);
      alert("Account created successfully!");
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f1f5f9">
      <Card sx={{ p: 4, width: 400, borderRadius: 4 }}>
        <Typography variant="h5" mb={2}>Create Account</Typography>
        <TextField fullWidth label="Username" name="username" margin="normal" onChange={handleChange}/>
        <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange}/>
        <TextField fullWidth label="Password" type="password" name="password" margin="normal" onChange={handleChange}/>
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
          Register
        </Button>
        <Button fullWidth href="/login" sx={{ mt: 1 }}>Already have an account?</Button>
      </Card>
    </Box>
  );
}
