import { useState } from "react";
import api from "../api/axiosClient";

interface ProfileEditModalProps {
  currentBio?: string;
  currentAvatar?: string;
  onClose: () => void;
  onUpdate: () => void; // Güncelleme bitince sayfayı yenilemek için
}

export default function ProfileEditModal({ currentBio, currentAvatar, onClose, onUpdate }: ProfileEditModalProps) {
  const [bio, setBio] = useState(currentBio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend'deki UserController /update endpointine istek atıyoruz
      await api.put("/User/update", {
        bio,
        avatarUrl
      });
      
      onUpdate(); // Profil sayfasındaki veriyi tazelet
      onClose();  // Modalı kapat
    } catch (err) {
      console.error("Profil güncellenemedi", err);
      alert("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(5px)"
    }} onClick={onClose}>
      
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e293b", padding: "30px", borderRadius: "16px",
          width: "400px", maxWidth: "90%", border: "1px solid rgba(255,255,255,0.1)",
          color: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Profili Düzenle</h2>

        {/* Avatar URL Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "0.9rem" }}>Avatar URL (Resim Linki)</label>
          <input 
            type="text" 
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/resim.jpg"
            style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              border: "1px solid #334155", background: "#0f172a", color: "white", outline: "none"
            }}
          />
          {avatarUrl && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <img src={avatarUrl} alt="Önizleme" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
        </div>

        {/* Bio Input */}
        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "0.9rem" }}>Biyografi</label>
          <textarea 
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinden bahset..."
            style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              border: "1px solid #334155", background: "#0f172a", color: "white", outline: "none", resize: "vertical"
            }}
          />
        </div>

        {/* Butonlar */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={{
              background: "transparent", color: "#94a3b8", border: "1px solid #334155",
              padding: "10px 20px", borderRadius: "8px", cursor: "pointer"
            }}
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#3b82f6", color: "white", border: "none",
              padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold",
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

      </div>
    </div>
  );
}