import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* --- SIDEBAR (SOL MENÜ) --- */}
      <aside
        style={{
          width: "280px",
          background: "#0f172a", // Slate-900
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          padding: "30px 20px",
          zIndex: 10,
          boxShadow: "4px 0 24px rgba(0,0,0,0.2)"
        }}
      >
        {/* Logo Alanı */}
        <div style={{ marginBottom: "40px", paddingLeft: "10px" }}>
          <h1 className="brand-logo" style={{ fontSize: "24px", margin: 0 }}>
            Sosyal Kütüphane
          </h1>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            Keşfet, Paylaş, Yaşa.
          </p>
        </div>

        {/* Menü Linkleri */}
        <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <NavLink to="/feed" className="nav-item">
            <span>Ana Akış</span>
          </NavLink>
          
          <NavLink to="/discover" className="nav-item">
            <span>Keşfet</span>
          </NavLink>

          <NavLink to="/profile" className="nav-item">
            <span>Profilim</span>
          </NavLink>
        </nav>

        {/* Alt Kısım (Örn: Çıkış veya Ayarlar) */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
          <p style={{ fontSize: "11px", color: "#475569", textAlign: "center" }}>
            © 2025 v1.0
          </p>
        </div>
      </aside>

      {/* --- MAIN CONTENT (ANA İÇERİK) --- */}
      <main
        style={{
          flex: 1,
          background: "radial-gradient(circle at top left, #1e293b, #020617)",
          position: "relative",
          overflowY: "auto", // Sadece içerik scroll olsun
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* İçerik Kapsayıcısı */}
        <div 
          style={{ 
            width: "100%", 
            maxWidth: "1000px", // İçeriği çok yayılmasın diye sınırlar
            padding: "40px",
            animation: "fadeIn 0.5s ease-in-out" // Sayfa açılış animasyonu
          }}
        >
          <Outlet />
        </div>
      </main>

    </div>
  );
}