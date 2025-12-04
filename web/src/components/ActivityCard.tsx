import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { Favorite, FavoriteBorder, ChatBubbleOutline } from "@mui/icons-material";

// Backend'den gelen Activity tipi (fallback'li)
export interface Activity {
  id: number;
  actionType: "rating" | "review" | "status";
  createdAt: string;

  content: {
    id: string;
    type: string;
    title: string;
    imageUrl?: string;
  };

  // Backend bazen "user" verir, bazen "userId"
  user?: {
    id: number;
    username: string;
  };

  userId?: number;
  username?: string;

  score?: number;
  status?: string;
  snippet?: string;

  likeCount?: number;
  likedByUser?: boolean;
}

// Zaman Hesabı
function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

// Avatar rengi
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);

  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
};

export default function ActivityCard({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  // Fallback DESTEK — backend user yerine userId dönerse FE kırılmaz
  const userId = activity.user?.id ?? activity.userId ?? 0;
  const username = activity.user?.username ?? activity.username ?? "Kullanıcı";

  const [liked, setLiked] = useState<boolean>(activity.likedByUser ?? false);
  const [likeCount, setLikeCount] = useState<number>(activity.likeCount ?? 0);

  // Like Toggle
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (liked) {
        await api.delete("/feed/like", { data: activity.id });
        setLiked(false);
        setLikeCount((n) => Math.max(0, n - 1));
      } else {
        await api.post("/feed/like", activity.id);
        setLiked(true);
        setLikeCount((n) => n + 1);
      }
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  // Aksiyon etiketi
  let actionLabel = "";
  let badgeColor = "";

  switch (activity.actionType) {
    case "rating":
      actionLabel = "PUANLADI";
      badgeColor = "rgba(251, 191, 36, 0.2)";
      break;
    case "review":
      actionLabel = "İNCELEDİ";
      badgeColor = "rgba(167, 139, 250, 0.2)";
      break;
    case "status":
      actionLabel = "GÜNCELLEDİ";
      badgeColor = "rgba(56, 189, 248, 0.2)";
      break;
    default:
      actionLabel = "İŞLEM";
      badgeColor = "rgba(255,255,255,0.15)";
  }

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
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
      onClick={() =>
        navigate(`/content/${activity.content.id}?type=${activity.content.type}`)
      }
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        
        {/* Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${userId}`);
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            marginRight: 14,
            background: getAvatarColor(username),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "white",
            fontSize: "1.2rem",
            border: "2px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
          }}
        >
          {username.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          {/* Username */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${userId}`);
            }}
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            {username}
          </div>

          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            {timeAgo(activity.createdAt)}
          </div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: badgeColor,
            letterSpacing: "1px",
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
              width: 100,
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
              lineHeight: 1.2,
            }}
          >
            {activity.content.title}
          </div>

          {activity.actionType === "rating" && (
            <div
              style={{
                color: "#fbbf24",
                fontSize: "1.2rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ⭐ {activity.score}/10
            </div>
          )}

          {activity.actionType === "review" && (
            <div
              style={{
                color: "#cbd5e1",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                background: "rgba(0,0,0,0.2)",
                padding: "12px",
                borderRadius: "12px",
                borderLeft: "3px solid #a78bfa",
              }}
            >
              "{activity.snippet}"
            </div>
          )}

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

      {/* FOOTER */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* ❤️ Beğen */}
        <div
          onClick={handleToggleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            color: liked ? "#ef4444" : "#cbd5e1",
          }}
        >
          {liked ? <Favorite /> : <FavoriteBorder />}
          <span>{likeCount}</span>
        </div>

        {/* 💬 Yorum Yap */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/content/${activity.content.id}?type=${activity.content.type}#comments`
            );
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            color: "#cbd5e1",
          }}
        >
          <ChatBubbleOutline />
          <span>Yorum Yap</span>
        </div>
      </div>
    </div>
  );
}
