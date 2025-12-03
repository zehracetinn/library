import { useEffect, useState } from "react";
import api from "../api/axiosClient";

interface AddToListModalProps {
  contentId: string;
  type: string;       // movie / book
  title: string;
  imageUrl?: string;
  onClose: () => void; // Modalı kapatma fonksiyonu
}

interface CustomList {
  id: number;
  name: string;
  items: { contentId: string }[]; // İçindeki elemanların sadece ID'leri yeterli
}

export default function AddToListModal({ contentId, type, title, imageUrl, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);

  // Listeleri Çek
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await api.get<CustomList[]>("/CustomList");
      setLists(res.data);
    } catch (err) {
      console.error("Listeler çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  // Yeni Liste Oluştur
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      await api.post("/CustomList", { name: newListName });
      setNewListName("");
      fetchLists(); // Listeleri yenile
    } catch (err) {
      alert("Liste oluşturulamadı.");
    }
  };

  // Listeye Ekle / Çıkar
  const toggleToList = async (listId: number) => {
    // UI'da anlık güncelleme (Optimistic UI) - Beklemeden tik işaretini değiştir
    setLists(prev => prev.map(l => {
      if (l.id === listId) {
        const exists = l.items.some(x => x.contentId === contentId);
        if (exists) {
          // Varsa çıkar
          return { ...l, items: l.items.filter(x => x.contentId !== contentId) };
        } else {
          // Yoksa ekle
          return { ...l, items: [...l.items, { contentId }] };
        }
      }
      return l;
    }));

    // Arka planda sunucuya gönder
    try {
      await api.post("/CustomList/toggle-item", {
        listId,
        contentId,
        type,
        title,
        imageUrl
      });
    } catch (err) {
      console.error("İşlem başarısız", err);
      fetchLists(); // Hata olursa gerçeği geri yükle
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={onClose}>
      
      {/* Modal İçeriği */}
      <div 
        onClick={(e) => e.stopPropagation()} // İçeriye tıklayınca kapanmasın
        style={{
          background: "#1e293b", padding: "24px", borderRadius: "16px",
          width: "400px", maxWidth: "90%", border: "1px solid #334155",
          color: "white"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>Listelerine Ekle</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}>✕</button>
        </div>

        {/* Yeni Liste Oluşturma Inputu */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input 
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Yeni liste adı..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white" }}
          />
          <button 
            onClick={handleCreateList}
            disabled={!newListName.trim()}
            style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
          >
            +
          </button>
        </div>

        {/* Listeler */}
        <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? <div>Yükleniyor...</div> : lists.map(list => {
            const isAdded = list.items.some(x => x.contentId === contentId);
            return (
              <div 
                key={list.id} 
                onClick={() => toggleToList(list.id)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "12px", 
                  padding: "10px", borderRadius: "8px", 
                  background: isAdded ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.03)",
                  border: isAdded ? "1px solid #3b82f6" : "1px solid transparent",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "4px",
                  border: "2px solid #94a3b8",
                  background: isAdded ? "#3b82f6" : "transparent",
                  borderColor: isAdded ? "#3b82f6" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "12px"
                }}>
                  {isAdded && "✓"}
                </div>
                <span style={{ fontWeight: 500 }}>{list.name}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#64748b" }}>{list.items.length} öğe</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}