import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import api from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)!;

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Şifreler uyuşmuyor!");
      return;
    }

    try {
      setError("");

      // Backend'e kayıt isteği
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // Kayıt olduktan sonra otomatik login
      await login(email, password);

      navigate("/feed");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Bu kullanıcı adı veya email zaten kullanımda.");
      } else {
        setError("Bir hata oluştu.");
      }
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
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={3}>
          Register
        </Typography>

        <Typography fontSize={14} mb={1}>Kullanıcı Adı</Typography>
        <TextField
          fullWidth
          placeholder="Kullanıcı adınız"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography fontSize={14} mb={1}>Email</Typography>
        <TextField
          fullWidth
          placeholder="Email adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography fontSize={14} mb={1}>Şifre</Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography fontSize={14} mb={1}>Şifre Tekrar</Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Şifre tekrar"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          sx={{ mb: 1 }}
        />

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
          onClick={handleRegister}
        >
          KAYIT OL
        </Button>

        {/* Geri Login'e */}
        <Typography
          mt={2}
          fontSize={14}
          color="primary"
          sx={{ cursor: "pointer", textAlign: "center" }}
          onClick={() => navigate("/login")}
        >
          Hesabın var mı? Giriş Yap
        </Typography>
      </Box>
    </Box>
  );
}
