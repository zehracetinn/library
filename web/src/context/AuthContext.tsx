import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../api/axiosClient";

interface User {
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean; // Yükleniyor durumu eklendi
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Başlangıçta yükleniyor

  // 1. Sayfa ilk açıldığında çalışır (F5 atınca kullanıcı gitmesin diye)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (token) {
            // Token varsa, basitçe kullanıcıyı var sayıyoruz.
            // İstersen burada backend'e /Auth/me isteği atıp gerçek kullanıcı verisini çekebilirsin.
            // Şimdilik token varsa oturum açık kalsın:
            setUser({ 
                email: "user@example.com", // Token'dan veya API'den çekilebilir
                username: "Kullanıcı" 
            }); 
        }
      } catch (error) {
        console.error("Oturum kontrol hatası", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // Kontrol bitti, sayfayı göster
      }
    };

    checkUserLoggedIn();
  }, []);

  // 2. Login Fonksiyonu
  const login = async (email: string, password: string) => {
    console.log("Login isteği atılıyor...", { email, password });
    
    const res = await api.post("/Auth/login", { email, password });
    
    // BACKEND CEVABINI KONTROL ET (Debug için)
    console.log("Login Başarılı! Gelen Veri:", res.data);

    // Backend'den token "token" mı yoksa "Token" mı geliyor? 
    // Garanti olsun diye ikisine de bakıyoruz:
    const token = res.data.token || res.data.Token; 

    if (token) {
        localStorage.setItem("token", token);
        console.log("Token başarıyla kaydedildi:", token);

        setUser({
            email: res.data.email || email,
            username: res.data.username || "Kullanıcı",
        });
    } else {
        console.error("HATA: Backend token göndermedi!", res.data);
    }
  };

  // 3. Logout Fonksiyonu
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login"; // Login sayfasına at
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
}