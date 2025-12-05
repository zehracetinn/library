import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";
import ProfileEditModal from "../components/ProfileEditModal";
import CreateListModal from "../components/CreateListModal"; // ✅ Modal Import Edildi

// --- TİP TANIMLAMALARI ---
interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;
  content: { id: string; type: string; title: string; imageUrl?: string; };
  user: { id: number; username: string; };
  score?: number;
  status?: string;
  snippet?: string;
}

interface UserProfile {
  user: { id: number; username: string; bio?: string; avatarUrl?: string; };
  stats: { followersCount: number; followingCount: number; };
  isSelf: boolean;
  isFollowing: boolean;
  activities: Activity[];
}

interface LibraryItem {
  id: number; contentId: string; title: string; imageUrl?: string; type: string; status: string;
}

interface LibraryData {
  watched: LibraryItem[]; toWatch: LibraryItem[]; read: LibraryItem[]; toRead: LibraryItem[];
}

interface CustomList {
  id: number; name: string; items: { contentId: string }[];
}

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  
  const [activeTab, setActiveTab] = useState<"watched" | "toWatch" | "read" | "toRead" | "activity" | "lists">("watched");
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ✅ LİSTE OLUŞTURMA MODAL STATE'İ
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get(`/User/profile/${id}`);
      setProfile(profileRes.data);

      const libRes = await api.get(`/User/library/${id}`);
      setLibrary(libRes.data);

      if (profileRes.data.isSelf) {
        const listRes = await api.get("/CustomList");
        setCustomLists(listRes.data);
      }
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!id) return;
    const profileRes = await api.get(`/User/profile/${id}`);
    setProfile(profileRes.data);
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await api.delete(`/Follow/${profile.user.id}`);
        setProfile({ ...profile, isFollowing: false });
      } else {
        await api.post(`/Follow/${profile.user.id}`);
        setProfile({ ...profile, isFollowing: true });
      }
    } catch (error) {
      console.error("Takip hatası:", error);
    }
  };

  if (loading || !profile || !library) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

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
      
      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)", padding: "60px 20px 40px", textAlign: "center", borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: "120px", height: "120px", margin: "0 auto 20px", borderRadius: "50%", background: getAvatarColor(profile.user.username), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "bold", color: "white", overflow: "hidden" }}>
          {profile.user.avatarUrl ? <img src={profile.user.avatarUrl} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : profile.user.username.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 10px", color: "white" }}>{profile.user.username}</h1>
        {profile.user.bio && <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto 20px" }}>{profile.user.bio}</p>}
        
        <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "24px" }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{profile.stats.followersCount}</div><div style={{ fontSize: "0.85rem", color: "#64748b" }}>Takipçi</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{profile.stats.followingCount}</div><div style={{ fontSize: "0.85rem", color: "#64748b" }}>Takip</div></div>
        </div>

        {!profile.isSelf ? (
          <button onClick={handleFollowToggle} style={{ background: profile.isFollowing ? "transparent" : "#3b82f6", color: profile.isFollowing ? "#94a3b8" : "white", border: profile.isFollowing ? "1px solid #334155" : "none", padding: "10px 30px", borderRadius: "24px", fontWeight: "bold", cursor: "pointer" }}>
            {profile.isFollowing ? "Takipten Çık" : "Takip Et"}
          </button>
        ) : (
          <button onClick={() => setShowEditModal(true)} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "10px 24px", borderRadius: "24px", fontWeight: "600", cursor: "pointer" }}>
            ✏️ Profili Düzenle
          </button>
        )}
      </div>

      {/* TABS */}
      <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", borderBottom: "1px solid #1e293b", marginBottom: "30px" }}>
          <TabButton label="👁️ İzlediklerim" isActive={activeTab === "watched"} onClick={() => setActiveTab("watched")} count={library.watched.length} />
          <TabButton label="📅 İzlenecekler" isActive={activeTab === "toWatch"} onClick={() => setActiveTab("toWatch")} count={library.toWatch.length} />
          <TabButton label="📖 Okuduklarım" isActive={activeTab === "read"} onClick={() => setActiveTab("read")} count={library.read.length} />
          <TabButton label="📚 Okunacaklar" isActive={activeTab === "toRead"} onClick={() => setActiveTab("toRead")} count={library.toRead.length} />
          
          {/* ✅ Listelerim Sekmesi - Sayıyı gösterir */}
          {profile.isSelf && (
            <TabButton label="📂 Listelerim" isActive={activeTab === "lists"} onClick={() => setActiveTab("lists")} count={customLists.length} />
          )}
          
          <TabButton label="⚡ Aktiviteler" isActive={activeTab === "activity"} onClick={() => setActiveTab("activity")} />
        </div>

        {/* --- İÇERİK ALANI --- */}
        
        {/* AKTİVİTELER */}
        {activeTab === "activity" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {profile.activities.map(act => <ActivityCard key={act.id} activity={act} />)}
            {profile.activities.length === 0 && <div style={{textAlign: "center", color: "#64748b"}}>Aktivite yok.</div>}
          </div>
        )}

        {/* ✅ ÖZEL LİSTELER (Burayı DÜZELTTİK) */}
        {activeTab === "lists" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
             
             {/* ✅ 1. KART: YENİ LİSTE OLUŞTUR (Her zaman görünür) */}
             {profile.isSelf && (
               <div 
                 onClick={() => setShowListModal(true)}
                 style={{ 
                   border: "2px dashed #334155", borderRadius: "12px", 
                   display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                   gap: "10px", cursor: "pointer", minHeight: "150px", color: "#94a3b8",
                   background: "rgba(30, 41, 59, 0.3)", transition: "all 0.2s"
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
               >
                 <div style={{ fontSize: "2.5rem" }}>+</div>
                 <div style={{ fontWeight: "bold" }}>Yeni Liste</div>
               </div>
             )}

             {/* ✅ 2. MEVCUT LİSTELER (Varsa) */}
             {customLists.map(list => (
                 <div key={list.id} style={{ 
                   background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
                   display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer", minHeight: "150px", justifyContent: "center"
                 }}>
                   <div style={{ fontSize: "2rem" }}>📂</div>
                   <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "white" }}>{list.name}</div>
                   <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>{list.items?.length || 0} içerik</div>
                 </div>
             ))}
          </div>
        )}

        {/* KÜTÜPHANE İÇERİĞİ */}
        {["watched", "toWatch", "read", "toRead"].includes(activeTab) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "24px" }}>
            {getActiveContent().map(item => (
              <div key={item.id} onClick={() => navigate(`/content/${item.contentId}?type=${item.type}`)} style={{ cursor: "pointer" }}>
                <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", marginBottom: "10px" }}>
                  <img src={item.imageUrl || "https://via.placeholder.com/150"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
              </div>
            ))}
            {getActiveContent().length === 0 && <div style={{gridColumn: "1/-1", textAlign: "center", color: "#64748b", padding: "40px"}}>İçerik yok.</div>}
          </div>
        )}
      </div>

      {showEditModal && <ProfileEditModal currentBio={profile.user.bio} currentAvatar={profile.user.avatarUrl} onClose={() => setShowEditModal(false)} onUpdate={refreshProfile} />}
      
      {/* ✅ LİSTE OLUŞTURMA MODALI */}
      {showListModal && (
        <CreateListModal 
            onClose={() => setShowListModal(false)}
            onSuccess={(newList) => setCustomLists([...customLists, newList])}
        />
      )}
    </div>
  );
}

function TabButton({ label, isActive, onClick, count }: { label: string, isActive: boolean, onClick: () => void, count?: number }) {
  return (
    <button onClick={onClick} style={{ background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent", borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent", borderRadius: "8px 8px 0 0", padding: "12px 16px", color: isActive ? "#3b82f6" : "#94a3b8", fontWeight: isActive ? "700" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", border: "none" }}>
      {label}
      {count !== undefined && <span style={{ background: isActive ? "#3b82f6" : "#334155", color: "white", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "10px" }}>{count}</span>}
    </button>
  );
}