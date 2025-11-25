import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";

export default function Login() {
  const { login } = useContext(AuthContext)!;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError("Email veya şifre hatalı!");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0d0f2d",
      }}
    >
      <Box
        sx={{
          width: 380,
          background: "white",
          borderRadius: "20px",
          p: 4,
          boxShadow: "0 0 40px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={3}
        >
          Login
        </Typography>

        {/* Email */}
        <Typography fontSize={14} mb={1}>
          Email
        </Typography>
        <TextField
          fullWidth
          placeholder="Type your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Password */}
        <Typography fontSize={14} mb={1}>
          Password
        </Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Type your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 1 }}
        />

        {/* Error message */}
        {error && (
          <Typography color="error" fontSize={14} mb={1}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: "#111",
            height: 48,
            borderRadius: "10px",
            "&:hover": { bgcolor: "#222" },
          }}
          onClick={handleLogin}
        >
          LOGIN
        </Button>
      </Box>
    </Box>
  );
}