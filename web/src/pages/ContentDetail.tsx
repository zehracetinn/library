import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

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
  rating?: number; 
}

interface RatingSummary {
  average: number;
  count: number;
}

interface Review {
  id: number;
  username?: string;
  text: string;
  createdAt: string;
}

export default function ContentDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") ?? "movie"; 

  // State
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);

  // Verileri Yükle
  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detailRes, ratingRes, reviewsRes] = await Promise.all([
        api.get<ContentDetail>(`/Content/${id}`, { params: { type } }),
        api.get<RatingSummary>(`/Ratings/content/${id}`, { params: { type } }).catch(() => ({ data: { average: 0, count: 0 } })), 
        api.get<Review[]>(`/Reviews/content/${id}`, { params: { type } }).catch(() => ({ data: [] })),
      ]);

      setContent(detailRes.data);
      setRatingSummary(ratingRes.data);
      setReviews(reviewsRes.data ?? []);
    } catch (err) {
      console.error("Detay yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id, type]);

  // İşlemler
  const handleRate = async () => {
  if (!id || userScore < 1 || userScore > 10) return;
  setSaving(true);

  try {
    await api.post("/Ratings", { 
      contentId: id,
      type,
      score: userScore,

      // Backend istediği için ekliyoruz ⬇  
      title: content?.title,
      imageUrl: content?.imageUrl
    });

    const r = await api.get<RatingSummary>(`/Ratings/content/${id}`, { params: { type } });
    setRatingSummary(r.data);

    alert("⭐ Puanın kaydedildi!");
  } catch (err: any) {
    console.error("Puanlama hatası:", err.response?.data ?? err);
  } finally {
    setSaving(false);
  }
};


  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await api.post("/UserContent/set-status", { contentId: id, type, status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      console.error("Durum hatası:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddReview = async () => {
    if (!id || !reviewText.trim()) return;
    setSaving(true);
    try {
      await api.post("/Reviews", { contentId: id, type, text: reviewText.trim() });
      setReviewText("");
      const reviewsRes = await api.get<Review[]>(`/Reviews/content/${id}`, { params: { type } });
      setReviews(reviewsRes.data ?? []);
    } catch (err) {
      console.error("Yorum hatası:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loader">Yükleniyor...</div>
      </div>
    );
  }

  const isMovie = type === "movie";

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", position: "relative", overflow: "hidden" }}>
      
      {/* --- ARKA PLAN (BACKDROP EFFECT) --- */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "500px",
          backgroundImage: `url(${content.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.4)",
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

        {/* --- ÜST BÖLÜM (HERO) --- */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
          
          {/* POSTER */}
          <div style={{ flex: "0 0 300px" }}>
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
            <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.1 }}>
              {content.title}
            </h1>
            
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", color: "#94a3b8", fontSize: "1.1rem" }}>
              <span>{content.year}</span>
              <span>•</span>
              {content.genre && <span>{content.genre}</span>}
              <span>•</span>
              <span>{isMovie ? "Film" : "Kitap"}</span>
            </div>

            {/* BUTONLAR VE PUANLAMA ALANI */}
            <div style={{ 
              background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(10px)", 
              padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)",
              marginBottom: "30px", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center"
            }}>
              
              {/* Ortalama Puan */}
              <div style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "24px" }}>
                <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "4px" }}>Genel Puan</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fbbf24" }}>
                   ⭐ {ratingSummary?.average?.toFixed(1) ?? "-"}
                </div>
              </div>

              {/* Kullanıcı Puanı */}
              <div>
                <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "8px" }}>Senin Puanın</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select 
                    value={userScore}
                    onChange={(e) => setUserScore(Number(e.target.value))}
                    style={{ 
                      background: "#0f172a", color: "white", border: "1px solid #334155", 
                      padding: "8px", borderRadius: "8px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="0">Seç...</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button 
                    onClick={handleRate}
                    disabled={saving}
                    style={{ 
                      background: "#6366f1", color: "white", border: "none", 
                      padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 
                    }}
                  >
                    {saving ? "..." : "Kaydet"}
                  </button>
                </div>
              </div>

              {/* Durum Butonları */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                {isMovie ? (
                  <>
                    <StatusButton label="👁️ İzledim" active={status === "watched"} onClick={() => handleStatusChange("watched")} />
                    <StatusButton label="📅 İzlenecek" active={status === "toWatch"} onClick={() => handleStatusChange("toWatch")} />
                  </>
                ) : (
                  <>
                    <StatusButton label="📖 Okudum" active={status === "read"} onClick={() => handleStatusChange("read")} />
                    <StatusButton label="📚 Okunacak" active={status === "toRead"} onClick={() => handleStatusChange("toRead")} />
                  </>
                )}
              </div>
            </div>

            {/* AÇIKLAMA */}
            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Özet</h3>
            <p style={{ lineHeight: 1.6, color: "#cbd5e1", fontSize: "1rem", maxWidth: "800px" }}>
              {content.description || "Açıklama bulunmuyor."}
            </p>

            <div style={{ marginTop: "20px", fontSize: "0.9rem", color: "#94a3b8" }}>
              {isMovie && content.director && <div><strong>Yönetmen:</strong> {content.director}</div>}
              {!isMovie && content.authors && <div><strong>Yazar:</strong> {content.authors}</div>}
            </div>
          </div>
        </div>

        {/* --- YORUMLAR BÖLÜMÜ --- */}
        <div style={{ marginTop: "60px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Yorumlar ve Tartışmalar</h2>
          
          {/* Yorum Yazma Alanı */}
          <div style={{ marginBottom: "40px", display: "flex", gap: "16px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              💬
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Bu içerik hakkında ne düşünüyorsun?"
                style={{
                  width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15, 23, 42, 0.6)", color: "white", minHeight: "100px", resize: "vertical",
                  outline: "none", fontSize: "1rem"
                }}
              />
              <div style={{ textAlign: "right", marginTop: "10px" }}>
                <button 
                  onClick={handleAddReview}
                  disabled={!reviewText.trim() || saving}
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white", border: "none",
                    padding: "10px 24px", borderRadius: "24px", fontWeight: "bold", cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)"
                  }}
                >
                  Yorumu Gönder
                </button>
              </div>
            </div>
          </div>

          {/* Yorum Listesi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             {reviews.length === 0 ? (
                <div style={{ color: "#64748b", fontStyle: "italic" }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
             ) : (
                reviews.map((r) => (
                  <div key={r.id} style={{ display: "flex", gap: "16px", animation: "fadeIn 0.5s" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `hsl(${Math.random() * 360}, 60%, 50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                      {(r.username || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "white" }}>{r.username || "Kullanıcı"}</span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(r.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.5 }}>{r.text}</p>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Yardımcı Buton Bileşeni
function StatusButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: active ? "1px solid #38bdf8" : "1px solid #334155",
        background: active ? "rgba(56, 189, 248, 0.2)" : "transparent",
        color: active ? "#38bdf8" : "#94a3b8",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      {label}
    </button>
  );
}