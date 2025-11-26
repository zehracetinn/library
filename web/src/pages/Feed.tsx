import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ActivityCard from "../components/ActivityCard";

// ----- Activity type'ı bileşen DIŞINDA TANIMLANMALI -----
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
// ---------------------------------------------------------

export default function Feed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    try {
      const res = await api.get("/Feed?page=1&pageSize=20");

      // Backend bazen { items: [...] } döner, bazen direkt array
      const data = res.data.items ?? res.data;

      setActivities(data);
    } catch (err) {
      console.log("FEED ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading)
    return (
      <div
        style={{
          padding: 20,
          color: "white",
          textAlign: "center",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        background: "linear-gradient(180deg, #0a0f28, #0f1335)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px", // Orta kolon
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            color: "white",
            marginBottom: 20,
            fontSize: "26px",
            fontWeight: 600,
          }}
        >
          Feed
        </h2>

        {activities.length === 0 && (
          <div style={{ color: "white" }}>Henüz aktivite yok.</div>
        )}

        {activities.map((a: Activity) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}
