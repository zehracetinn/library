import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel } from "@mui/material";

export default function Login() {
  // Context'ten login fonksiyonunu al
  const auth = useContext(AuthContext);
  
  // Context null ise hata vermemesi için kontrol (veya non-null assertion)
  const login = auth?.login!;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      if (login) {
        await login(email, password);
        navigate("/feed");
      } else {
        setError("Kimlik doğrulama servisine ulaşılamadı.");
      }
    } catch (err) {
      setError("Email veya şifre hatalı!");
    }
  };

  // --- STİL AYARLARI ---
  const inputStyle = {
    bgcolor: "#333",
    borderRadius: "4px",
    input: { color: "white" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { border: "none" },
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
        backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        },
      }}
    >
      {/* Sol Üst Logo */}
      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          top: 25, left: 40, zIndex: 2, fontWeight: 900,
          background: "linear-gradient(to right, #8b5cf6, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0px 2px 10px rgba(99, 102, 241, 0.3)",
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
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          borderRadius: "8px",
          p: { xs: 4, md: "60px 68px 40px" },
          display: "flex", flexDirection: "column", color: "white",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={4} textAlign="left">
          Oturum Aç
        </Typography>

        {error && (
          <Box sx={{ bgcolor: "#ef4444", p: 2, borderRadius: 1, mb: 2 }}>
            <Typography fontSize={14} color="white">{error}</Typography>
          </Box>
        )}

        <TextField
          fullWidth
          placeholder="E-posta veya telefon numarası"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{ ...inputStyle, mb: 2 }}
        />

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
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "white", fontWeight: "bold", height: 48, borderRadius: "4px",
            fontSize: "1rem", textTransform: "none",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
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

        {/* Alt Linkler (Beni Hatırla & Şifremi Unuttum) */}
        <Box
          sx={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            mt: 2, color: "#b3b3b3", fontSize: "13px",
          }}
        >
          {/* Checkbox Eklendi */}
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                sx={{ color: "#b3b3b3", '&.Mui-checked': { color: "#8b5cf6" } }} 
              />
            }
            label={<Typography fontSize={13}>Beni hatırla</Typography>}
          />

          {/* Şifremi Unuttum Linki */}
          <Typography
            onClick={() => navigate("/forgot-password")}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline", color: "white" } }}
          >
            Şifremi Unuttum?
          </Typography>
        </Box>

        {/* Kayıt Ol Bölümü */}
        <Box mt={8}>
          <Typography color="#737373" fontSize={16}>
            Social Library'ye yeni misiniz?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "white", cursor: "pointer", fontWeight: 600 }}
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