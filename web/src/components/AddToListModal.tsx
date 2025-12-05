import { useEffect, useState } from "react";
import api from "../api/axiosClient";

// 📌 Modal props interface
interface AddToListModalProps {
  contentId: string;
  type: string;
  title: string;
  imageUrl?: string;
  onClose: () => void;
}

interface CustomList {
  id: number;
  name: string;
  items: { contentId: string }[];
}

export default function AddToListModal({
  contentId,
  type,
  title,
  imageUrl,
  onClose
}: AddToListModalProps) {

  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const res = await api.get("/CustomList");
      setLists(res.data);
    } catch (err) {
      console.error("Listeler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (listId: number) => {
    setSavingId(listId);
    try {
      // 🛠️ DÜZELTME BURADA YAPILDI:
      // 1. URL "/CustomList/toggle-item" olarak değiştirildi (Backend ile uyumlu)
      // 2. "listId" URL yerine body'nin içine eklendi (Backend DTO ile uyumlu)
      
      const res = await api.post("/CustomList/toggle-item", {
        listId: listId,  // <--- Backend bunu body içinde bekliyor
        contentId: contentId,
        type: type,
        title: title,
        imageUrl: imageUrl
      });

      // Backend "added" veya "removed" dönebilir (Toggle mantığı)
      if (res.data.action === "added") {
        alert("✅ İçerik listeye eklendi!");
      } else {
        alert("🗑️ İçerik listeden çıkarıldı.");
      }
      
      onClose();

    } catch (err) {
      console.error("Listeye işlem hatası:", err);
      alert("Bir hata oluştu.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        width: "420px",
        background: "#1e293b",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        animation: "fadeInScale 0.2s ease-out"
      }}>

        {/* Başlık */}
        <h2 style={{
          marginBottom: "20px",
          fontSize: "1.5rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          📂 Listeye Ekle / Çıkar
        </h2>

        {/* İçerik kartı */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          background: "#0f172a",
          padding: "12px",
          borderRadius: "12px"
        }}>
          <img
            src={imageUrl || "https://via.placeholder.com/80x120"}
            alt={title}
            style={{ width: "60px", height: "90px", borderRadius: "6px", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{title}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{type.toUpperCase()}</div>
          </div>
        </div>

        {/* Listeler */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Yükleniyor...</div>
        ) : lists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", opacity: 0.7 }}>
            Hiç özel listen yok. Profilinden yeni liste oluşturabilirsin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lists.map(list => {
              // İçerik bu listede var mı kontrolü (Basit kontrol)
              const isAdded = list.items?.some(i => i.contentId === String(contentId));
              
              return (
                <button
                  key={list.id}
                  onClick={() => handleAdd(list.id)}
                  style={{
                    background: savingId === list.id ? "#0ea5e9" : (isAdded ? "rgba(16, 185, 129, 0.2)" : "#334155"),
                    border: isAdded ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.15)",
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    color: "white",
                    fontWeight: 600,
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}
                >
                  <span>📂 {list.name}</span>
                  {savingId === list.id ? (
                    <span style={{fontSize: "0.8rem"}}>İşleniyor...</span>
                  ) : (
                    isAdded && <span style={{fontSize: "1.2rem"}}>✅</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Kapat */}
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            background: "transparent",
            color: "#94a3b8",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            textAlign: "center",
            width: "100%"
          }}
        >
          Kapat
        </button>
      </div>
    </div>
  );
}