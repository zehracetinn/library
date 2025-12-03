import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import ProfileEditModal from "../components/ProfileEditModal";

// --- TİP TANIMLAMALARI ---

// Backend'den gelen Aktivite yapısı (ActivityCard bileşeni ile uyumlu)
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
}

// Profil Verisi Yapısı
interface UserProfile {
  user: {
    id: number;
    username: string;
    bio?: string;
    avatarUrl?: string;
  };
  stats: {
    followersCount: number;
    followingCount: number;
  };
  isSelf: boolean;
  isFollowing: boolean;
  activities: Activity[];
}

// Kütüphane Öğesi Yapısı
interface LibraryItem {
  id: number;
  contentId: string;
  title: string;
  imageUrl?: string;
  type: string;
  status: string;
}

// Kütüphane Veri Paketi
interface LibraryData {
  watched: LibraryItem[];
  toWatch: LibraryItem[];
  read: LibraryItem[];
  toRead: LibraryItem[];
}

// Özel Liste Yapısı
interface CustomList {
  id: number;
  name: string;
  items: { contentId: string }[];
}

// Renkli Avatar Yardımcı Fonksiyonu
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE YÖNETİMİ ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  
  // Varsayılan sekme: 'watched'
  const [activeTab, setActiveTab] = useState<"watched" | "toWatch" | "read" | "toRead" | "activity" | "lists">("watched");
  const [loading, setLoading] = useState(true);
  
  // Modal Görünürlük State'i
  const [showEditModal, setShowEditModal] = useState(false);

  // --- VERİ YÜKLEME ---
  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Profil Bilgileri ve Aktiviteler
      const profileRes = await api.get(`/User/profile/${id}`);
      const profileData = profileRes.data;
      setProfile(profileData);

      // 2. Kütüphane İçeriği
      const libRes = await api.get(`/User/library/${id}`);
      setLibrary(libRes.data);

      // 3. Özel Listeler (Sadece kendi profilimse)
      if (profileData.isSelf) {
        const listRes = await api.get("/CustomList");
        setCustomLists(listRes.data);
      }

    } catch (err) {
      console.error("Profil yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Profil güncellendiğinde sadece profil verisini yenile (Sayfayı titretmeden)
  const refreshProfile = async () => {
    if (!id) return;
    try {
      const profileRes = await api.get(`/User/profile/${id}`);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Profil yenilenemedi:", err);
    }
  };

  const handleFollowToggle = async () => {
    alert("Takip sistemi yakında eklenecek!");
  };

  // --- LOADING EKRANI ---
  if (loading || !profile || !library) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // --- AKTİF SEKME İÇERİĞİ ---
  const getActiveContent = () => {
    switch (activeTab) {
      case "watched": return library.watched;
      case "toWatch": return library.toWatch;
      case "read": return library.read;
      case "toRead": return library.toRead;
      default: return [];
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", paddingBottom: "60px" }}>
      
      {/* 1. HEADER (Profil Başlığı) */}
      <div style={{ 
        background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)", 
        padding: "60px 20px 40px 20px", 
        textAlign: "center",
        borderBottom: "1px solid #1e293b"
      }}>
        
        {/* Avatar */}
        <div style={{ 
          width: "120px", height: "120px", margin: "0 auto 20px auto", 
          borderRadius: "50%", border: "4px solid #0f172a",
          background: getAvatarColor(profile.user.username),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3rem", fontWeight: "bold", color: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          overflow: "hidden"
        }}>
          {profile.user.avatarUrl ? (
            <img src={profile.user.avatarUrl} alt="avatar" style={{width: "100%", height: "100%", objectFit: "cover"}} />
          ) : (
            profile.user.username.charAt(0).toUpperCase()
          )}
        </div>

        {/* İsim & Bio */}
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 10px 0", color: "white" }}>
          {profile.user.username}
        </h1>
        {profile.user.bio && (
          <p style={{ maxWidth: "500px", margin: "0 auto 20px auto", color: "#94a3b8", lineHeight: 1.6 }}>
            {profile.user.bio}
          </p>
        )}

        {/* İstatistikler */}
        <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}>{profile.stats.followersCount}</div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Takipçi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}>{profile.stats.followingCount}</div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Takip</div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        {!profile.isSelf ? (
          <button 
            onClick={handleFollowToggle}
            style={{
              background: profile.isFollowing ? "transparent" : "#3b82f6",
              color: profile.isFollowing ? "#94a3b8" : "white",
              border: profile.isFollowing ? "1px solid #334155" : "none",
              padding: "10px 30px", borderRadius: "24px", fontWeight: "bold", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {profile.isFollowing ? "Takipten Çık" : "Takip Et"}
          </button>
        ) : (
          <button 
            onClick={() => setShowEditModal(true)} // Modalı Aç
            style={{ 
              background: "rgba(255,255,255,0.1)", color: "white", border: "none", 
              padding: "10px 24px", borderRadius: "24px", fontWeight: "600", cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            ✏️ Profili Düzenle
          </button>
        )}
      </div>

      {/* 2. SEKMELER (Tabs) */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ 
          display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", 
          borderBottom: "1px solid #1e293b", marginBottom: "30px", marginTop: "30px"
        }}>
          <TabButton label="👁️ İzlediklerim" isActive={activeTab === "watched"} onClick={() => setActiveTab("watched")} count={library.watched.length} />
          <TabButton label="📅 İzlenecekler" isActive={activeTab === "toWatch"} onClick={() => setActiveTab("toWatch")} count={library.toWatch.length} />
          <TabButton label="📖 Okuduklarım" isActive={activeTab === "read"} onClick={() => setActiveTab("read")} count={library.read.length} />
          <TabButton label="📚 Okunacaklar" isActive={activeTab === "toRead"} onClick={() => setActiveTab("toRead")} count={library.toRead.length} />
          
          {/* Sadece kendi profilimse Listelerim sekmesi */}
          {profile.isSelf && (
            <TabButton label="📂 Listelerim" isActive={activeTab === "lists"} onClick={() => setActiveTab("lists")} count={customLists.length} />
          )}
          
          <TabButton label="⚡ Aktiviteler" isActive={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
        </div>

        {/* 3. İÇERİK ALANI */}
        
        {/* A. AKTİVİTELER */}
        {activeTab === "activity" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {profile.activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Henüz bir aktivite yok.</div>
            ) : (
              profile.activities.map(act => <ActivityCard key={act.id} activity={act} />)
            )}
          </div>
        )}

        {/* B. ÖZEL LİSTELER */}
        {activeTab === "lists" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
             {customLists.length === 0 ? (
               <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>Henüz hiç listen yok.</div>
             ) : (
               customLists.map(list => (
                 <div key={list.id} style={{ 
                   background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
                   display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer", transition: "transform 0.2s" 
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                 onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                 >
                   <div style={{ fontSize: "2rem" }}>📂</div>
                   <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "white" }}>{list.name}</div>
                   <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>{list.items.length} içerik</div>
                 </div>
               ))
             )}
          </div>
        )}

        {/* C. KÜTÜPHANE GRID (Filmler / Kitaplar) */}
        {["watched", "toWatch", "read", "toRead"].includes(activeTab) && (
          <div>
            {getActiveContent().length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontStyle: "italic" }}>
                Bu listede henüz içerik yok.
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
                gap: "24px" 
              }}>
                {getActiveContent().map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/content/${item.contentId}?type=${item.type}`)}
                    style={{ cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", marginBottom: "10px", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
                      <img 
                        src={item.imageUrl || "https://via.placeholder.com/150"} 
                        alt={item.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                      <div style={{ 
                        position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", 
                        opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "flex-end", padding: "10px"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                      >
                        <span style={{color: "white", fontSize: "0.8rem"}}>Detayları Gör</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. PROFİL DÜZENLEME MODALI */}
      {showEditModal && (
        <ProfileEditModal
          currentBio={profile.user.bio}
          currentAvatar={profile.user.avatarUrl}
          onClose={() => setShowEditModal(false)}
          onUpdate={refreshProfile}
        />
      )}

    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function TabButton({ label, isActive, onClick, count }: { label: string, isActive: boolean, onClick: () => void, count?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
        border: "none",
        borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
        borderRadius: "8px 8px 0 0",
        padding: "12px 16px",
        color: isActive ? "#3b82f6" : "#94a3b8",
        fontWeight: isActive ? "700" : "500",
        cursor: "pointer",
        fontSize: "0.95rem",
        display: "flex", alignItems: "center", gap: "8px",
        whiteSpace: "nowrap",
        transition: "all 0.2s"
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{ 
          background: isActive ? "#3b82f6" : "#334155", 
          color: "white", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "10px", minWidth: "20px", textAlign: "center"
        }}>
          {count}
        </span>
      )}
    </button>
  );
}