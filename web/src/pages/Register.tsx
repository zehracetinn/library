import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import api from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  // AuthContext'i güvenli şekilde al
  const authContext = useContext(AuthContext);
  const login = authContext?.login;

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. İstemci Tarafı Kontrolleri
    if (!username || !email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Şifreler uyuşmuyor!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 2. Backend'e Kayıt İsteği
      await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // 3. Başarılıysa Otomatik Giriş Yap
      if (login) {
        await login(email, password);
        navigate("/feed");
      } else {
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        navigate("/login");
      }

    } catch (err: any) {
      console.error("Kayıt Hatası:", err);

      // --- GELİŞMİŞ HATA YAKALAMA ---
      if (err.response) {
        const data = err.response.data;
        const status = err.response.status;

        // Senaryo A: Kullanıcı adı/email dolu (409 Conflict)
        if (status === 409) {
            setError("Bu kullanıcı adı veya email zaten kullanımda.");
        }
        // Senaryo B: Backend düz metin döndü (Örn: "Şifre çok kısa")
        else if (typeof data === 'string') {
            setError(data);
        }
        // Senaryo C: Backend mesaj objesi döndü ({ message: "..." })
        else if (data?.message) {
            setError(data.message);
        }
        // Senaryo D: Validasyon hatası ({ errors: { Password: ["..."] } })
        else if (data?.errors) {
            // İlk hatayı yakalayıp gösterelim
            const firstKey = Object.keys(data.errors)[0];
            setError(`${data.errors[firstKey][0]}`);
        }
        // Senaryo E: Bilinmeyen bir sunucu hatası
        else {
            setError("Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.");
        }
      } else {
        setError("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
      }
    } finally {
        setLoading(false);
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
        backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        "&::before": {
            content: '""', position: "absolute", inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          zIndex: 2,
          width: 380,
          background: "white",
          borderRadius: "20px",
          p: 4,
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={3}>
          Kayıt Ol
        </Typography>

        <Typography fontSize={14} mb={1} fontWeight="bold">Kullanıcı Adı</Typography>
        <TextField
          fullWidth
          placeholder="Kullanıcı adınız"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        <Typography fontSize={14} mb={1} fontWeight="bold">Email</Typography>
        <TextField
          fullWidth
          placeholder="Email adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        <Typography fontSize={14} mb={1} fontWeight="bold">Şifre</Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        <Typography fontSize={14} mb={1} fontWeight="bold">Şifre Tekrar</Typography>
        <TextField
          fullWidth
          type="password"
          placeholder="Şifre tekrar"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        {error && (
          <Box sx={{ bgcolor: "#fee2e2", p: 1.5, borderRadius: 1, mb: 2, border: "1px solid #ef4444" }}>
            <Typography color="#b91c1c" fontSize={13} fontWeight="bold" textAlign="center">
              {error}
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 1,
            bgcolor: "#111",
            height: 48,
            borderRadius: "10px",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#333" },
            opacity: loading ? 0.7 : 1
          }}
          onClick={handleRegister}
        >
          {loading ? "İŞLENİYOR..." : "KAYIT OL"}
        </Button>

        <Typography
          mt={3}
          fontSize={14}
          color="primary"
          sx={{ cursor: "pointer", textAlign: "center", fontWeight: "600" }}
          onClick={() => navigate("/login")}
        >
          Zaten hesabın var mı? Giriş Yap
        </Typography>
      </Box>
    </Box>
  );
}