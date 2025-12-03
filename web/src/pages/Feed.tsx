import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import { useNavigate } from "react-router-dom";

// ✅ Backend'den gelen veri yapısına uygun Interface
interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;
  
  // İçerik (Nested Object)
  content: {
    id: string;
    type: string;
    title: string;
    imageUrl?: string;
  };
  
  // Kullanıcı (Nested Object)
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
      
      // 🛠️ DÜZELTME: Backend bazen direkt liste, bazen { items: [] } dönebilir.
      // Array.isArray kontrolü ile hatayı önlüyoruz.
      let data: Activity[] = [];
      
      if (Array.isArray(res.data)) {
        // Eğer direkt liste geldiyse
        data = res.data;
      } else if (res.data && Array.isArray(res.data.items)) {
        // Eğer { items: [...] } şeklinde sayfalama yapısı geldiyse
        data = res.data.items;
      }
      
      setActivities(data);
    } catch (err) {
      console.error("FEED ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", padding: "40px 20px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
        
        {/* Keşfet Butonu */}
        <div style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}>
          <button
            onClick={() => navigate("/discover")}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              padding: "10px 20px", borderRadius: "12px", color: "white",
              border: "none", cursor: "pointer", fontWeight: 600,
              boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            🔍 Keşfet
          </button>
        </div>

        <h2 style={{ color: "#e2e8f0", marginBottom: "30px", fontSize: "28px", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
          Sosyal Akış
        </h2>

        {activities.length === 0 ? (
          <div style={{ color: "#94a3b8", textAlign: "center", marginTop: "40px", background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px" }}>
            Henüz aktivite yok. "Keşfet" butonuna basıp ilk içeriğini puanla!
          </div>
        ) : (
          activities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))
        )}
        
        <div style={{ height: "50px" }}></div>
      </div>
    </div>
  );
}