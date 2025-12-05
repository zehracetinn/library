import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

// --- TİP TANIMLAMALARI ---
type ContentType = "movie" | "book";

interface DiscoverItem {
  id: number | string;
  title: string;
  year?: string;
  imageUrl?: string;
  type?: ContentType;
  averageRating?: number;
}

// --- SAHTE VERİ ---
const MOCK_DATA: DiscoverItem[] = [
  { id: 101, title: "Harry Potter ve Felsefe Taşı", year: "2001", averageRating: 9.2, type: "book", imageUrl: "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg" },
  { id: 102, title: "Inception", year: "2010", averageRating: 8.8, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" },
  { id: 104, title: "Yüzüklerin Efendisi", year: "2003", averageRating: 9.5, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZKKMtZRlNS00Y2JkLWI1YWAtN2JmY2M1ZDM2YWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg" },
];

// --- KATEGORİ BİLEŞENİ (Değişmedi) ---
interface CategoryRowProps {
  title: string;
  items: DiscoverItem[];
  contentType: ContentType;
  onClickItem: (item: DiscoverItem, type: ContentType) => void;
}

function CategoryRow({ title, items, contentType, onClickItem }: CategoryRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 40, paddingLeft: 20 }}>
      <h3 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      <div className="hide-scrollbar" style={{ display: "flex", overflowX: "auto", gap: 16, paddingBottom: 10, scrollBehavior: "smooth" }}>
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            onClick={() => onClickItem(item, contentType)}
            style={{ flex: "0 0 auto", width: 160, cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div style={{ width: "100%", height: 240, borderRadius: 12, overflow: "hidden", background: "#1e293b", position: "relative" }}>
              <img src={item.imageUrl || "https://via.placeholder.com/160x240"} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.8)", color: "#fbbf24", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontWeight: "bold" }}>
                {item.averageRating ? item.averageRating.toFixed(1) : "-"}
              </div>
            </div>
            <div style={{ marginTop: 8, padding: "0 4px" }}>
              <div style={{ color: "white", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>{item.year || "Yıl yok"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ANA DISCOVER SAYFASI ---
export default function Discover() {
  const navigate = useNavigate();

  const [topRated, setTopRated] = useState<DiscoverItem[]>([]);
  const [mostPopular, setMostPopular] = useState<DiscoverItem[]>([]);
  
  // ARAMA STATE'LERİ
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<ContentType>("movie");
  const [filterYear, setFilterYear] = useState<string>("");   // YENİ: Yıl Filtresi
  const [filterRating, setFilterRating] = useState<string>(""); // YENİ: Puan Filtresi
  
  const [searchResults, setSearchResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTop, resPop] = await Promise.all([
            api.get("/Discover/top-rated").catch(() => null),
            api.get("/Discover/most-popular").catch(() => null)
        ]);

        const topData = resTop?.data?.items || resTop?.data || [];
        const popData = resPop?.data?.items || resPop?.data || [];

        setTopRated(topData.length ? topData : MOCK_DATA);
        setMostPopular(popData.length ? popData : MOCK_DATA);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Boş arama yapılmasını engellemek istiyorsan burayı açabilirsin
    // if (!searchQuery.trim() && !filterYear && !filterRating) return;

    try {
      console.log("🔎 Arama Yapılıyor:", { searchQuery, searchType, filterYear, filterRating });

      // DÜZELTME: Endpoint "/Discover/search" olmalıydı (Content değil)
      const res = await api.get("/Discover/search", {
        params: { 
            query: searchQuery, 
            // Backend "genre" bekliyor ama şimdilik "type" kullanıyorsan backend'de maplemek gerekebilir.
            // Backend'deki Controller'ın "genre" parametresi string alıyor.
            year: filterYear || null, 
            rating: filterRating || null 
        },
      });
      
      const data = res.data;
      let results: DiscoverItem[] = [];
      
      if (Array.isArray(data)) results = data;
      else if (data.items) results = data.items; // Backend { items: [...] } dönüyor

      setSearchResults(results);
    } catch (error) {
      console.error("Arama hatası", error);
    }
  };

  const inputStyle = {
    padding: "12px", 
    borderRadius: "12px", 
    background: "#1e293b", 
    color: "white", 
    border: "1px solid #334155",
    outline: "none"
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", paddingBottom: 50 }}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* HEADER */}
      <div style={{ textAlign: "center", paddingTop: 40, marginBottom: 40, paddingLeft: 20, paddingRight: 20 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Keşfetmeye Başla
        </h1>
        
        {/* Arama Formu */}
        <form onSubmit={handleSearch} style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          
          {/* Tip Seçimi */}
          <select 
            value={searchType} onChange={(e) => setSearchType(e.target.value as ContentType)}
            style={inputStyle}
          >
            <option value="movie">Film</option>
            <option value="book">Kitap</option>
          </select>

          {/* Metin Arama */}
          <input 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Film adı..."
            style={{ ...inputStyle, flex: "1 1 200px" }}
          />

          {/* Yıl Filtresi (Yeni) */}
          <input 
            type="number"
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            placeholder="Yıl (Örn: 2023)"
            style={{ ...inputStyle, width: "120px" }}
          />

          {/* Puan Filtresi (Yeni) */}
          <input 
            type="number"
            step="0.1"
            min="0" max="10"
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            placeholder="Min Puan"
            style={{ ...inputStyle, width: "100px" }}
          />

          {/* Ara Butonu */}
          <button type="submit" style={{ padding: "12px 24px", borderRadius: "12px", background: "#6366f1", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            Ara
          </button>
        </form>
      </div>

      {/* İÇERİK */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b" }}>Yükleniyor...</div>
      ) : (
        <>
          {searchResults.length > 0 && (
             <CategoryRow title="🔍 Filtrelenmiş Sonuçlar" items={searchResults} contentType={searchType} onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} />
          )}

          {/* Sadece arama yapılmadığında önerileri göster */}
          {searchResults.length === 0 && (
            <>
              <CategoryRow title="🔥 En Popülerler" items={mostPopular} contentType="movie" onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} />
              <CategoryRow title="⭐ En Yüksek Puanlılar" items={topRated} contentType="movie" onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} />
            </>
          )}
        </>
      )}
    </div>
  );
}