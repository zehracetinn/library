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

// --- SAHTE VERİ (API BOŞ GELİRSE BUNLAR GÖRÜNECEK) ---
const MOCK_DATA: DiscoverItem[] = [
  { id: 101, title: "Harry Potter ve Felsefe Taşı", year: "2001", averageRating: 9.2, type: "book", imageUrl: "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg" },
  { id: 102, title: "Inception", year: "2010", averageRating: 8.8, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" },
  { id: 103, title: "Interstellar", year: "2014", averageRating: 8.9, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg" },
  { id: 104, title: "Yüzüklerin Efendisi", year: "2003", averageRating: 9.5, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZKKMtZRlNS00Y2JkLWI1YWAtN2JmY2M1ZDM2YWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg" },
  { id: 105, title: "Dune", year: "2021", averageRating: 8.4, type: "movie", imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg" },
  { id: 106, title: "The Dark Knight", year: "2008", averageRating: 9.0, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg" },
];

// --- YATAY KAYDIRILABİLİR KATEGORİ BİLEŞENİ ---
interface CategoryRowProps {
  title: string;
  items: DiscoverItem[];
  contentType: ContentType;
  onClickItem: (item: DiscoverItem, type: ContentType) => void;
}

function CategoryRow({ title, items, contentType, onClickItem }: CategoryRowProps) {
  // Items boş olsa bile render etsin diye kontrolü kaldırdım, ama boşsa "veri yok" yazmasın diye kontrol ekliyorum
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 40, paddingLeft: 20 }}>
      <h3 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        {title}
      </h3>

      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 16,
          paddingBottom: 10,
          scrollBehavior: "smooth",
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`} // Key hatasını önlemek için index ekledim
            onClick={() => onClickItem(item, contentType)}
            style={{
              flex: "0 0 auto",
              width: 160,
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {/* Poster */}
            <div style={{
              width: "100%", height: 240, borderRadius: 12, overflow: "hidden", 
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)", background: "#1e293b", position: "relative"
            }}>
              <img
                src={item.imageUrl || "https://via.placeholder.com/160x240?text=No+Image"}
                alt={item.title}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/160x240?text=Hata"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              
              {/* Puan Rozeti */}
              <div style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.8)", color: "#fbbf24",
                padding: "2px 6px", borderRadius: 4, fontSize: 12, fontWeight: "bold"
              }}>
                {item.averageRating ? item.averageRating.toFixed(1) : "-"}
              </div>
            </div>

            {/* Başlık */}
            <div style={{ marginTop: 8, padding: "0 4px" }}>
              <div style={{ color: "white", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.title}
              </div>
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<ContentType>("movie");
  const [searchResults, setSearchResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugData = async () => {
      try {
        console.log("🚀 API İSTEKLERİ BAŞLIYOR...");

        // 1. Top Rated İsteği
        console.log("1. Top Rated isteği atılıyor: /Discover/top-rated");
        const resTop = await api.get("/Discover/top-rated").catch(err => {
          console.error("❌ Top Rated Hatası:", err.response?.status, err.message);
          return null; // Hata olsa bile devam et
        });
        
        if (resTop) {
          console.log("✅ Top Rated Cevabı Geldi:", resTop.data);
        }

        // 2. Most Popular İsteği
        console.log("2. Most Popular isteği atılıyor: /Discover/most-popular");
        const resPop = await api.get("/Discover/most-popular").catch(err => {
          console.error("❌ Most Popular Hatası:", err.response?.status, err.message);
          return null;
        });

        if (resPop) {
          console.log("✅ Most Popular Cevabı Geldi:", resPop.data);
        }

        // Verileri State'e atma denemesi
        const topData = resTop?.data?.items || resTop?.data || [];
        const popData = resPop?.data?.items || resPop?.data || [];

        console.log("📊 İşlenmiş Top Rated Verisi:", topData);
        console.log("📊 İşlenmiş Popular Verisi:", popData);

        // Eğer boşsa sahte veri kullanmaya devam et (şimdilik ekran boş kalmasın)
        setTopRated(topData.length ? topData : MOCK_DATA);
        setMostPopular(popData.length ? popData : MOCK_DATA);

      } catch (error) {
        console.error("Genel Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    debugData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await api.get("/Content/search", {
        params: { query: searchQuery, type: searchType },
      });
      const data = res.data;
      
      let results: DiscoverItem[] = [];
      if (Array.isArray(data)) results = data;
      else if (data.items) results = data.items;
      else if (data.id) results = [data];

      setSearchResults(results);
    } catch (error) {
      console.error("Arama hatası", error);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", paddingBottom: 50 }}>
       {/* Scrollbar gizleme stili */}
       <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign: "center", paddingTop: 40, marginBottom: 40, paddingLeft: 20, paddingRight: 20 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Keşfetmeye Başla
        </h1>
        
        {/* Arama Kutusu */}
        <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: 10 }}>
          <select 
            value={searchType} onChange={(e) => setSearchType(e.target.value as ContentType)}
            style={{ padding: "12px", borderRadius: "12px", background: "#1e293b", color: "white", border: "1px solid #334155" }}
          >
            <option value="movie">Film</option>
            <option value="book">Kitap</option>
          </select>
          <input 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Harry Potter, Dune..."
            style={{ flex: 1, padding: "12px 20px", borderRadius: "12px", background: "#1e293b", color: "white", border: "1px solid #334155", outline: "none" }}
          />
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
             <CategoryRow title="🔍 Arama Sonuçları" items={searchResults} contentType={searchType} onClickItem={(item) => navigate(`/content/${item.id}`)} />
          )}

          {/* BU İKİSİ ARTIK MOCK DATA SAYESİNDE KESİN GÖRÜNECEK */}
          <CategoryRow title="🔥 En Popülerler" items={mostPopular} contentType="movie" onClickItem={(item) => navigate(`/content/${item.id}`)} />
          <CategoryRow title="⭐ En Yüksek Puanlılar" items={topRated} contentType="movie" onClickItem={(item) => navigate(`/content/${item.id}`)} />
        </>
      )}
    </div>
  );
}