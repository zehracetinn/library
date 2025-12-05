import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function Login() {
  const { login } = useContext(AuthContext)!;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      navigate("/feed");
    } catch (err) {
      setError("Email veya şifre hatalı!");
    }
  };

  // --- STİL AYARLARI ---
  // Inputlar için ortak stil (Koyu tema uyumlu)
  const inputStyle = {
    bgcolor: "#333", // Koyu gri arka plan
    borderRadius: "4px",
    input: { color: "white" }, // Yazı rengi beyaz
    "& .MuiOutlinedInput-root": {
      "& fieldset": { border: "none" }, // Kenarlığı kaldır
      "&:hover fieldset": { border: "none" },
      "&.Mui-focused fieldset": { border: "none" },
    },
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // Arka plan resmi (Netflix tarzı, senin istediğin görsel)
        backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          // Resmin üzerine siyah perde (overlay)
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Biraz daha koyulaştırdım ki mor buton patlasın
          zIndex: 1,
        },
      }}
    >
      {/* Sol Üst Logo */}
      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          top: 25,
          left: 40,
          zIndex: 2,
          fontWeight: 900,
          // Senin temanın mor rengiyle logo
          background: "linear-gradient(to right, #8b5cf6, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0px 2px 10px rgba(99, 102, 241, 0.3)", // Hafif mor parıltı
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 2
        }}
      >
        SOCIAL LIBRARY
      </Typography>

      <Box
        sx={{
          zIndex: 2,
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "rgba(0, 0, 0, 0.75)", // Yarı saydam siyah kutu
          borderRadius: "8px", // Köşeleri biraz daha yumuşattım
          p: { xs: 4, md: "60px 68px 40px" },
          display: "flex",
          flexDirection: "column",
          color: "white",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)" // Derinlik katan gölge
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={4} textAlign="left">
          Oturum Aç
        </Typography>

        {/* Error Mesajı */}
        {error && (
          <Box sx={{ bgcolor: "#ef4444", p: 2, borderRadius: 1, mb: 2 }}>
            <Typography fontSize={14} color="white">
              {error}
            </Typography>
          </Box>
        )}

        {/* Email */}
        <TextField
          fullWidth
          placeholder="E-posta veya telefon numarası"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{ ...inputStyle, mb: 2 }}
        />

        {/* Password */}
        <TextField
          fullWidth
          type="password"
          placeholder="Parola"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{ ...inputStyle, mb: 4 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            // 🔥 Senin Mor Gradient Butonun
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "white",
            fontWeight: "bold",
            height: 48,
            borderRadius: "4px",
            fontSize: "1rem",
            textTransform: "none",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)", // Mor gölge efekti
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": { 
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                transform: "scale(1.02)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.6)"
            },
          }}
          onClick={handleLogin}
        >
          Oturum Aç
        </Button>

        {/* Alt Linkler */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            color: "#b3b3b3",
            fontSize: "13px",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <Typography fontSize={13} color="#b3b3b3">Beni hatırla</Typography>
          </Box>
          <Typography
            onClick={() => navigate("/forgot-password")}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline", color: "white" } }}
          >
            Yardım ister misiniz?
          </Typography>
        </Box>

        {/* Kayıt Ol Bölümü */}
        <Box mt={8}>
          <Typography color="#737373" fontSize={16}>
            Social Library'ye yeni misiniz?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Şimdi kaydolun.
            </span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}