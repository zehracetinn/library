import React from "react";

interface Activity {
  id: number;
  userId: number;
  username: string;
  avatarUrl?: string;
  actionType: "rating" | "review" | "status";
  title: string;
  imageUrl?: string;
  score?: number;
  snippet?: string;
  status?: string;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "720px",
        margin: "26px auto",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.3)",
        transition: "0.25s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <img
          src={activity.avatarUrl || "/default-avatar.png"}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            marginRight: 14,
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>
            {activity.username}
          </div>

          <div style={{ color: "#ccc", fontSize: 12 }}>{timeAgo(activity.createdAt)}</div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            fontSize: 12,
            color: "#fff",
            background: "rgba(255,255,255,0.15)",
            textTransform: "uppercase",
          }}
        >
          {activity.actionType}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex" }}>
        {activity.imageUrl && (
          <img
            src={activity.imageUrl}
            style={{
              width: 130,
              height: "auto",
              borderRadius: 12,
              marginRight: 20,
              objectFit: "cover",
              boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontSize: "1.35rem",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {activity.title}
          </div>

          {/* RATING */}
          {activity.actionType === "rating" && (
            <div style={{ color: "#ffd86b", fontSize: "1.25rem", fontWeight: 700 }}>
              ⭐ {activity.score}/10
            </div>
          )}

          {/* REVIEW */}
          {activity.actionType === "review" && (
            <div style={{ color: "#ccc", fontSize: "0.95rem", lineHeight: "1.4" }}>
              {activity.snippet}…{" "}
              <span style={{ color: "#6bb6ff", cursor: "pointer" }}>devamını oku</span>
            </div>
          )}

          {/* STATUS */}
          {activity.actionType === "status" && (
            <div
              style={{
                marginTop: 8,
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 20,
                background: "rgba(100,200,255,0.15)",
                color: "#8cd3ff",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              {activity.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
