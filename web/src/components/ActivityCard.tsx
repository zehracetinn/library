import { useNavigate } from "react-router-dom";

// Backend'den gelen iç içe veri yapısı
interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;
  // İçerik Detayları (Content objesi içinde)
  content: {
    id: string;
    type: string;
    title: string;
    imageUrl?: string;
  };
  // Kullanıcı Detayları (User objesi içinde)
  user: {
    id: number;
    username: string;
  };
  score?: number;
  status?: string;
  snippet?: string;
}

// Zaman Hesaplayıcı
function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

// Renkli Avatar Üreteci
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
};

export default function ActivityCard({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  // Aksiyon Tipine Göre Metin ve İkon
  let actionLabel = "";
  let badgeColor = "";
  
  switch (activity.actionType) {
    case "rating":
      actionLabel = "PUANLADI";
      badgeColor = "rgba(251, 191, 36, 0.2)"; // Sarımsı
      break;
    case "review":
      actionLabel = "İNCELEDİ";
      badgeColor = "rgba(167, 139, 250, 0.2)"; // Morumsu
      break;
    case "status":
      actionLabel = "GÜNCELLEDİ";
      badgeColor = "rgba(56, 189, 248, 0.2)"; // Mavimsi
      break;
    default:
      actionLabel = "İŞLEM";
      badgeColor = "rgba(255, 255, 255, 0.15)";
  }

  // Durum Metni Çevirisi (Watched -> İzledi)
  const getStatusText = (status?: string) => {
    if (status === "watched") return "👁️ İzledi";
    if (status === "toWatch") return "📅 İzleyecek";
    if (status === "read") return "📖 Okudu";
    if (status === "toRead") return "📚 Okuyacak";
    return "Listeye ekledi";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "720px",
        margin: "0 auto 26px auto",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        background: "rgba(30, 41, 59, 0.7)", // Biraz daha koyu, okunabilirlik için
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
        transition: "all 0.25s ease",
        cursor: "pointer"
      }}
      // Hover Efekti
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
      // Tıklayınca Detaya Git
      onClick={() => navigate(`/content/${activity.content.id}?type=${activity.content.type}`)}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        {/* Avatar (Resim yoksa Harf Gösteriyoruz) */}
        <div style={{
            width: 48, height: 48, borderRadius: "50%", marginRight: 14,
            background: getAvatarColor(activity.user?.username || "A"),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", color: "white", fontSize: "1.2rem",
            border: "2px solid rgba(255,255,255,0.1)"
        }}>
           {(activity.user?.username || "U").charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>
            {activity.user?.username || "Anonim"}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>{timeAgo(activity.createdAt)}</div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: badgeColor,
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {actionLabel}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {activity.content.imageUrl && (
          <img
            src={activity.content.imageUrl}
            alt={activity.content.title}
            style={{
              width: 100, // Mobilde çok yer kaplamasın diye biraz küçülttüm
              height: "auto",
              aspectRatio: "2/3",
              borderRadius: 12,
              marginRight: 20,
              objectFit: "cover",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            {activity.content.title}
          </div>

          {/* RATING */}
          {activity.actionType === "rating" && (
            <div style={{ color: "#fbbf24", fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⭐</span> {activity.score}/10
            </div>
          )}

          {/* REVIEW */}
          {activity.actionType === "review" && (
            <div style={{ 
                color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6", 
                background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "12px",
                borderLeft: "3px solid #a78bfa"
            }}>
              "{activity.snippet}"
            </div>
          )}

          {/* STATUS */}
          {activity.actionType === "status" && (
            <div
              style={{
                marginTop: 8,
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 20,
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {getStatusText(activity.status)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}