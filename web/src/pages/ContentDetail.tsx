import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import AddToListModal from "../components/AddToListModal"; // ✅ Modal import edildi

// --- TİP TANIMLAMALARI ---
interface ContentDetail {
  id: string;
  title: string;
  description?: string;
  year?: string;
  imageUrl?: string;
  director?: string;
  authors?: string;
  genre?: string;
}

interface RatingSummary {
  average: number;
  count: number;
}

interface UserRatingResponse {
  score: number;
}

interface UserStatusResponse {
  status: string; 
}

interface Review {
  id: number;
  userId: number;
  username: string;
  text: string;
  createdAt: string;
}

// Yardımcı Fonksiyon: Renkli avatar için hash üretici
const getHashCode = (str: string) => {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

export default function ContentDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") ?? "movie";

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({ average: 0, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [status, setStatus] = useState<string>("none");
  const [userScore, setUserScore] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewText, setReviewText] = useState("");
  
  // ✅ Modal Görünürlük State'i
  const [showListModal, setShowListModal] = useState(false);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detailRes, ratingRes, reviewsRes, userStatusRes, userRatingRes] = await Promise.all([
        api.get<ContentDetail>(`/Content/${id}`, { params: { type } }),
        api.get<RatingSummary>(`/Ratings/content/${id}`, { params: { type } }).catch(() => ({ data: { average: 0, count: 0 } })),
        api.get<Review[]>(`/Reviews/content/${id}`, { params: { type } }).catch(() => ({ data: [] })),
        api.get<UserStatusResponse>(`/UserContent/status`, { params: { contentId: id, type } }).catch(() => ({ data: { status: "none" } })),
        api.get<UserRatingResponse>(`/Ratings/user/${id}`, { params: { type } }).catch(() => ({ data: { score: 0 } }))
      ]);

      setContent(detailRes.data);
      setRatingSummary(ratingRes.data);
      setReviews(reviewsRes.data || []);
      setStatus(userStatusRes.data.status);
      setUserScore(userRatingRes.data.score);

    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id, type]);

  const handleRate = async () => {
    if (!id || userScore < 1 || userScore > 10 || !content) return;
    setSaving(true);
    try {
      await api.post("/Ratings", { 
        contentId: id,
        type,
        score: userScore,
        title: content.title,     
        imageUrl: content.imageUrl 
      });

      const r = await api.get<RatingSummary>(`/Ratings/content/${id}`, { params: { type } });
      setRatingSummary(r.data);
      alert("Puanınız kaydedildi!");
    } catch (err) {
      console.error("Puanlama hatası:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !content) return;
    setSaving(true);
    try {
      await api.post("/UserContent/set-status", { 
        contentId: id, 
        type, 
        status: newStatus,
        title: content.title,      
        imageUrl: content.imageUrl 
      });
      setStatus(newStatus);
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddReview = async () => {
    if (!id || !reviewText.trim() || !content) return;
    setSaving(true);
    try {
      await api.post("/Reviews", { contentId: id, type, text: reviewText.trim() });
      setReviewText("");
      const reviewsRes = await api.get<Review[]>(`/Reviews/content/${id}`, { params: { type } });
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error("Yorum hatası:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const isMovie = type === "movie";

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", position: "relative", overflowX: "hidden" }}>
      
      {/* ARKA PLAN */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "60vh",
          backgroundImage: `url(${content.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.3)",
          zIndex: 0,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* GERİ BUTONU */}
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: "rgba(255,255,255,0.1)", border: "none", color: "white", 
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "30px",
            backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: "8px"
          }}
        >
          ← Geri Dön
        </button>

        {/* ÜST BÖLÜM (HERO) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
          
          {/* POSTER */}
          <div style={{ flex: "0 0 300px", maxWidth: "100%" }}>
            <img
              src={content.imageUrl}
              alt={content.title}
              style={{
                width: "100%", borderRadius: "16px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)"
              }}
            />
          </div>

          {/* DETAYLAR */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {content.title}
            </h1>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "20px", color: "#94a3b8", fontSize: "1.1rem" }}>
              <span>{content.year}</span>
              <span>•</span>
              {content.genre && <span>{content.genre}</span>}
              <span>•</span>
              <span style={{background: isMovie ? "#3b82f6" : "#f59e0b", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold"}}>
                {isMovie ? "Film" : "Kitap"}
              </span>
            </div>

            {/* AKSİYON PANELİ (Puanlama & Butonlar) */}
            <div style={{ 
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)", 
              padding: "24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "30px", display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              
              {/* ORTALAMA PUAN */}
              <div style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "30px" }}>
                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "4px" }}>Genel Puan</div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fbbf24", lineHeight: 1 }}>
                   {ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : "-"}
                   <span style={{fontSize: "1rem", color: "#64748b", marginLeft: "4px"}}>/ 10</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>{ratingSummary.count} oy</div>
              </div>

              {/* KULLANICI PUANI */}
              <div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Senin Puanın</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select 
                    value={userScore}
                    onChange={(e) => setUserScore(Number(e.target.value))}
                    style={{ 
                      background: "#0f172a", color: "white", border: "1px solid #334155", 
                      padding: "10px", borderRadius: "8px", outline: "none", cursor: "pointer", fontSize: "1rem"
                    }}
                  >
                    <option value="0">Puan Ver...</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button 
                    onClick={handleRate}
                    disabled={saving || userScore === 0}
                    style={{ 
                      background: "#6366f1", color: "white", border: "none", 
                      padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600,
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? "..." : "Kaydet"}
                  </button>
                </div>
              </div>

              {/* BUTONLAR (İzledim, Listeye Ekle) */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
                
                {/* ✅ YENİ EKLENEN BUTON: Listeye Ekle */}
                <button 
                  onClick={() => setShowListModal(true)}
                  style={{
                    padding: "12px 20px", borderRadius: "10px", border: "1px solid #334155",
                    background: "transparent", color: "#e2e8f0", fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "#94a3b8"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "#334155"}
                >
                  📂 Listeye Ekle
                </button>

                {isMovie ? (
                  <>
                    <StatusButton 
                      label="👁️ İzledim" 
                      isActive={status === "watched"} 
                      onClick={() => handleStatusChange("watched")} 
                    />
                    <StatusButton 
                      label="📅 İzlenecek" 
                      isActive={status === "toWatch"} 
                      onClick={() => handleStatusChange("toWatch")} 
                    />
                  </>
                ) : (
                  <>
                    <StatusButton 
                      label="📖 Okudum" 
                      isActive={status === "read"} 
                      onClick={() => handleStatusChange("read")} 
                    />
                    <StatusButton 
                      label="📚 Okunacak" 
                      isActive={status === "toRead"} 
                      onClick={() => handleStatusChange("toRead")} 
                    />
                  </>
                )}
              </div>
            </div>

            {/* AÇIKLAMA */}
            <h3 style={{ fontSize: "1.4rem", marginBottom: "12px", fontWeight: 600, color: "white" }}>Özet</h3>
            <p style={{ lineHeight: 1.7, color: "#cbd5e1", fontSize: "1.05rem", maxWidth: "800px" }}>
              {content.description || "Bu içerik için bir açıklama bulunmuyor."}
            </p>

            <div style={{ marginTop: "24px", fontSize: "0.95rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "4px" }}>
              {isMovie && content.director && <div><strong style={{color:"#e2e8f0"}}>Yönetmen:</strong> {content.director}</div>}
              {!isMovie && content.authors && <div><strong style={{color:"#e2e8f0"}}>Yazar:</strong> {content.authors}</div>}
            </div>
          </div>
        </div>

        {/* YORUMLAR BÖLÜMÜ */}
        <div style={{ marginTop: "80px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "30px", fontWeight: 700 }}>Yorumlar ({reviews.length})</h2>
          
          <div style={{ marginBottom: "50px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
              ✍️
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={isMovie ? "Bu film hakkında ne düşünüyorsun?" : "Bu kitap hakkında ne düşünüyorsun?"}
                style={{
                  width: "100%", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15, 23, 42, 0.6)", color: "white", minHeight: "120px", resize: "vertical",
                  outline: "none", fontSize: "1rem", fontFamily: "inherit",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <div style={{ textAlign: "right", marginTop: "12px" }}>
                <button 
                  onClick={handleAddReview}
                  disabled={!reviewText.trim() || saving}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none",
                    padding: "12px 30px", borderRadius: "30px", fontWeight: "bold", cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
                    opacity: (!reviewText.trim() || saving) ? 0.5 : 1,
                    transition: "transform 0.1s"
                  }}
                >
                  {saving ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", color: "#64748b" }}>
                  <div style={{fontSize: "40px", marginBottom: "10px"}}>💬</div>
                  <div>Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
                </div>
             ) : (
                reviews.map((r) => (
                  <div key={r.id} style={{ display: "flex", gap: "16px", background: "rgba(30, 41, 59, 0.3)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `hsl(${Math.abs(getHashCode(r.username) || 0) % 360}, 60%, 50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", flexShrink: 0, textTransform: "uppercase" }}>
                      {(r.username || "K").charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, color: "white", fontSize: "1.05rem" }}>{r.username || "Kullanıcı"}</span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{new Date(r.createdAt).toLocaleDateString("tr-TR", {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                      </div>
                      <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>{r.text}</p>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>

      </div>

      {/* ✅ MODAL PENCERESİ: Buraya koşullu olarak eklendi */}
      {showListModal && content && (
        <AddToListModal
          contentId={content.id}
          type={type}
          title={content.title}
          imageUrl={content.imageUrl}
          onClose={() => setShowListModal(false)}
        />
      )}

    </div>
  );
}

function StatusButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 20px",
        borderRadius: "10px",
        border: isActive ? "1px solid #38bdf8" : "1px solidrgb(42, 54, 70)",
        background: isActive ? "rgba(56, 189, 248, 0.15)" : "transparent",
        color: isActive ? "#38bdf8" : "#94a3b8",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      {label}
      {isActive && <span style={{fontSize: "10px"}}>●</span>}
    </button>
  );
}