import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import api from "../api/axiosClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSend = async () => {
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.");
    } catch (err) {
      setMessage("Bir hata oluştu.");
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
          Şifre Sıfırlama
        </Typography>

        <Typography fontSize={14} mb={1}>
          Email adresiniz
        </Typography>

        <TextField
          fullWidth
          placeholder="mail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onClick={handleSend}
        >
          Gönder
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
