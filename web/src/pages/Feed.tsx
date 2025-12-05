import { useEffect, useState, useRef } from "react"; // useRef eklendi
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import { useNavigate } from "react-router-dom";

// ... Interface tanımların aynı kalacak ...
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
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 1. Scroll edilecek kapsayıcı için referans
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const loadFeed = async (pageNumber: number) => {
    if (!hasMore && pageNumber !== 1) return;

    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/feed?page=${pageNumber}&pageSize=10`);
      
      const newItems = res.data?.items || [];
      
      if (Array.isArray(newItems)) {
        if (pageNumber === 1) {
          setActivities(newItems);
        } else {
          setActivities((prev) => [...prev, ...newItems]);
        }

        if (newItems.length === 0 || newItems.length < 10) {
          setHasMore(false);
        }
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("FEED ERROR:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(page);
  }, [page]);

  // 2. Window listener yerine bu fonksiyonu doğrudan div'in onScroll'una vereceğiz
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Zaten yükleniyorsa veya veri bittiyse dur
    if (loadingMore || !hasMore) return;

    // Mantık: ScrollTop (kaydırılan miktar) + ClientHeight (görünen yükseklik) >= ScrollHeight (toplam yükseklik) - Eşik
    const { scrollTop, clientHeight, scrollHeight } = container;
    
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleGoToProfile = () => {
    if (currentUserId) {
      navigate(`/profile/${currentUserId}`);
    } else {
      navigate("/login");
    }
  };

  // --- İLK YÜKLEME EKRANI ---
  if (loading && page === 1) {
    return (
      <div
        className="flex items-center justify-center min-h-screen relative"
        style={{
          backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} />
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent z-10"></div>
      </div>
    );
  }

  return (
    <div 
      // 3. REF BURAYA BAĞLANDI
      ref={scrollContainerRef}
      // 4. SCROLL EVENT BURAYA BAĞLANDI
      onScroll={handleScroll}
      style={{ 
        height: "100vh", // EKRANI TAM KAPLA
        overflowY: "auto", // KENDİ İÇİNDE SCROLL AÇ
        padding: "40px 20px",
        backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative"
      }}
    >
      <div 
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", 
          zIndex: 0, pointerEvents: "none"
        }} 
      />

      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        
        {/* --- NAVBAR (Fixed yerine absolute kalabilir çünkü container scroll oluyor) --- */}
        <div style={{ position: "absolute", right: 0, top: 0, zIndex: 10, display: "flex", gap: "10px" }}>
           {/* ... Butonlar aynı kalabilir ... */}
          <button
            onClick={handleGoToProfile}
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "10px 20px",
              borderRadius: "8px",
              color: "#e2e8f0",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            👤 Profilim
          </button>

          <button
            onClick={() => navigate("/discover")}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              padding: "10px 20px",
              borderRadius: "8px",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            🔍 Keşfet
          </button>
        </div>

        <h2
          style={{
            color: "#fff", marginBottom: "30px", fontSize: "28px", fontWeight: 800,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px",
          }}
        >
          Sosyal Akış
        </h2>

        {/* --- AKTİVİTE LİSTESİ --- */}
        {activities.map((a) => <ActivityCard key={`${a.id}-${a.createdAt}`} activity={a} />)}

        {activities.length === 0 && !loading && (
          <div
            style={{
              color: "#94a3b8", textAlign: "center", marginTop: "40px",
              background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(5px)",
              padding: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            Henüz aktivite yok. “Keşfet”e basıp içerik ekleyebilirsin!
          </div>
        )}

        {loadingMore && (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {!hasMore && activities.length > 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "14px" }}>
            🎉 Hepsi bu kadar! Başka aktivite yok.
          </div>
        )}

        {/* Scroll payı bırakmak için */}
        <div style={{ height: "50px" }} />
      </div>
    </div>
  );
}