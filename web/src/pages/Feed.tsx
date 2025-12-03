import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import { useNavigate } from "react-router-dom";

// ✅ GÜNCELLEME: Interface, ActivityCard'ın beklediği yapıya uygun hale getirildi
interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;
  
  // İçerik (Düz değil, obje içinde)
  content: {
    id: string;
    type: string;
    title: string;
    imageUrl?: string;
  };
  
  // Kullanıcı (Düz değil, obje içinde)
  user: {
    id: number;
    username: string;
  };

  score?: number;
  status?: string;
  snippet?: string;
}

export default function Feed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadFeed = async () => {
    try {
      const res = await api.get("/Feed");
      // Backend'deki son değişiklikle veriyi direkt liste olarak dönüyoruz
      setActivities(res.data);
    } catch (err) {
      console.log("FEED ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        background: "linear-gradient(180deg, #0a0f28, #0f1335)", // Senin istediğin renkler
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px", // Kart genişliğiyle uyumlu olsun diye biraz artırdım
          padding: "0 20px",
          position: "relative",
        }}
      >
        {/* 🔍 Keşfet butonu — SAĞ ÜST */}
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 0, // Biraz daha aşağı aldım, başlık ile çakışmasın
            zIndex: 10
          }}
        >
          <button
            onClick={() => navigate("/discover")}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              padding: "10px 20px",
              borderRadius: "12px",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            🔍 Keşfet
          </button>
        </div>

        <h2
          style={{
            color: "white",
            marginBottom: 30,
            fontSize: "28px",
            fontWeight: 700,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "15px"
          }}
        >
          Sosyal Akış
        </h2>

        {activities.length === 0 && (
          <div style={{ color: "#94a3b8", textAlign: "center", marginTop: "40px", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px" }}>
            Henüz aktivite yok. "Keşfet" butonuna basıp ilk içeriğini puanla!
          </div>
        )}

        {activities.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
        
        {/* Alt boşluk */}
        <div style={{ height: "50px" }}></div>
      </div>
    </div>
  );
}