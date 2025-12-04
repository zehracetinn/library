import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import api from "../api/axiosClient";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleReset = async () => {
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage("Şifre başarıyla güncellendi.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Token geçersiz veya süresi dolmuş.");
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
        }}
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          Yeni Şifre Belirle
        </Typography>

        <Typography fontSize={14} mb={1}>
          Yeni Şifre
        </Typography>

        <TextField
          fullWidth
          type="password"
          placeholder="Yeni şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#111",
            height: 48,
            borderRadius: "10px",
            "&:hover": { bgcolor: "#222" },
          }}
          onClick={handleReset}
        >
          Şifreyi Sıfırla
        </Button>

        {message && (
          <Typography textAlign="center" mt={2} color="green">
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
