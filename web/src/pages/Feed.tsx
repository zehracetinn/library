import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import { useNavigate } from "react-router-dom";

// Backend ile uyumlu Activity interface
interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;

  content: {
    id: string;
    type: string;
    title: string;
    imageUrl?: string;
  };

  user: {
    id: number;
    username: string;
  };

  score?: number;
  status?: string;
  snippet?: string;

  likeCount?: number;
  likedByUser?: boolean;
}

export default function Feed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Giriş yapan kullanıcının ID'sini al (Login sırasında localStorage'a kaydettiğini varsayıyoruz)
  // Eğer Context API kullanıyorsan oradan da çekebilirsin.
  const currentUserId = localStorage.getItem("userId"); 

  const loadFeed = async () => {
    try {
      const res = await api.get("/feed");
      console.log("FEED RESPONSE:", res.data);

      if (res.data && Array.isArray(res.data.items)) {
        setActivities(res.data.items);
      } else {
        console.error("Beklenmeyen veri formatı:", res.data);
        setActivities([]);
      }
    } catch (err) {
      console.error("FEED ERROR:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // Profil sayfasına gitme fonksiyonu
  const handleGoToProfile = () => {
    if (currentUserId) {
      navigate(`/profile/${currentUserId}`);
    } else {
      // ID bulunamazsa login'e atabilirsin veya uyarı verebilirsin
      console.warn("Kullanıcı ID bulunamadı, lütfen tekrar giriş yapın.");
      navigate("/login"); 
    }
  };

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
        }}
      >
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", padding: "40px 20px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
        
        {/* --- BUTON GRUBU (SAĞ ÜST KÖŞE) --- */}
        <div style={{ position: "absolute", right: 0, top: 0, zIndex: 10, display: "flex", gap: "10px" }}>
          
          {/* 1. Profilim Butonu (YENİ EKLENDİ) */}
          <button
            onClick={handleGoToProfile}
            style={{
              background: "rgba(30, 41, 59, 0.8)", // Daha koyu, şeffaf bir arka plan
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 20px",
              borderRadius: "12px",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(30, 41, 59, 1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)"}
          >
            👤 Profilim
          </button>

          {/* 2. Keşfet Butonu (MEVCUT) */}
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔍 Keşfet
          </button>
        </div>
        {/* ---------------------------------- */}

        <h2
          style={{
            color: "#e2e8f0",
            marginBottom: "30px",
            fontSize: "28px",
            fontWeight: 700,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "15px",
          }}
        >
          Sosyal Akış
        </h2>

        {activities.length === 0 ? (
          <div
            style={{
              color: "#94a3b8",
              textAlign: "center",
              marginTop: "40px",
              background: "rgba(255,255,255,0.05)",
              padding: "40px",
              borderRadius: "16px",
            }}
          >
            Henüz aktivite yok. “Keşfet”e basıp içerik ekleyebilirsin!
          </div>
        ) : (
          activities.map((a) => <ActivityCard key={a.id} activity={a} />)
        )}

        <div style={{ height: "50px" }} />
      </div>
    </div>
  );
}