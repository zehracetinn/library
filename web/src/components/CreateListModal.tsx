import { useState } from "react";
import api from "../api/axiosClient";

interface Props {
  onClose: () => void;
  onSuccess: (newList: any) => void;
}

export default function CreateListModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Backend'e sadece liste ismini gönderiyoruz
      const res = await api.post("/CustomList", { name });
      
      // Başarılı olursa yeni listeyi üst bileşene (Profile) yolluyoruz
      onSuccess(res.data);
      onClose();
    } catch (error) {
      console.error("Liste oluşturma hatası:", error);
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#1e293b", padding: "30px", borderRadius: "16px", width: "90%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ color: "white", marginBottom: "20px", fontSize: "1.4rem" }}>Yeni Liste Oluştur</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontSize: "0.9rem" }}>Liste Adı</label>
            <input 
              value={name} onChange={(e) => setName(e.target.value)} 
              placeholder="Örn: En İyi Bilim Kurgu Filmleri" autoFocus
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer" }}>İptal</button>
            <button type="submit" disabled={!name.trim() || loading} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}