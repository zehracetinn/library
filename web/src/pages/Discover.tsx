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

// --- SAHTE VERİ (Yükleme hatası olursa gösterilir) ---
const MOCK_DATA: DiscoverItem[] = [
  { id: 101, title: "Harry Potter ve Felsefe Taşı", year: "2001", averageRating: 9.2, type: "book", imageUrl: "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg" },
  { id: 102, title: "Inception", year: "2010", averageRating: 8.8, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg" },
  { id: 104, title: "Yüzüklerin Efendisi", year: "2003", averageRating: 9.5, type: "movie", imageUrl: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZKKMtZRlNS00Y2JkLWI1YWAtN2JmY2M1ZDM2YWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg" },
];

// --- KATEGORİ BİLEŞENİ ---
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
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterRating, setFilterRating] = useState<string>("");
  
  const [searchResults, setSearchResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sayfa ilk açıldığında popülerleri çek (Sadece Film çekiyor varsayıyoruz)
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

  // --- DÜZELTİLEN FONKSİYON ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return; // Boşsa arama

    try {
      console.log("🔎 Arama Yapılıyor:", { searchQuery, searchType, filterYear, filterRating });
      setLoading(true); // Arama başlarken loading aç

      const res = await api.get("/Discover/search", {
        params: { 
            query: searchQuery, 
            type: searchType, // <--- BURASI EKSİKTİ, ARTIK BAKEND'E TÜR GİDİYOR
            year: filterYear || null, 
            rating: filterRating || null 
        },
      });
      
      const data = res.data;
      let results: DiscoverItem[] = [];
      
      if (Array.isArray(data)) results = data;
      else if (data.items) results = data.items;

      setSearchResults(results);
    } catch (error) {
      console.error("Arama hatası", error);
      setSearchResults([]); // Hata varsa sonuçları temizle
    } finally {
        setLoading(false); // Arama bitince loading kapat
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

  if (loading && searchResults.length === 0 && topRated.length === 0) {
    // Sadece ilk yüklemede tam ekran loading göster
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} />
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent z-10"></div>
      </div>
    );
  }

  return (
    <div style={{ 
        width: "100%", 
        minHeight: "100vh", 
        paddingBottom: 50,
        backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative"
    }}>
      <div 
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 0, pointerEvents: "none"
        }} 
      />

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", paddingTop: 40, marginBottom: 40, paddingLeft: 20, paddingRight: 20 }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Keşfetmeye Başla
          </h1>
          
          <form onSubmit={handleSearch} style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            
            <select 
              value={searchType} onChange={(e) => setSearchType(e.target.value as ContentType)}
              style={inputStyle}
            >
              <option value="movie">Film 🎬</option>
              <option value="book">Kitap 📚</option>
            </select>

            <input 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === "movie" ? "Film adı..." : "Kitap adı..."}
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />

            <input 
              type="number"
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              placeholder="Yıl (2023)"
              style={{ ...inputStyle, width: "100px" }}
            />

            <button type="submit" disabled={loading} style={{ padding: "12px 24px", borderRadius: "12px", background: "#6366f1", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "Ara"}
            </button>
          </form>
        </div>

        {/* --- SONUÇLAR --- */}
        
        {/* Arama Sonuçları Varsa */}
        {searchResults.length > 0 && (
            <CategoryRow 
                title={`🔍 "${searchQuery}" için Sonuçlar (${searchType === 'movie' ? 'Film' : 'Kitap'})`} 
                items={searchResults} 
                contentType={searchType} // Frontend'de de doğru tipe göre tıklama yapacak
                onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} 
            />
        )}

        {/* Arama Yapılmamışsa Varsayılanlar */}
        {searchResults.length === 0 && searchQuery === "" && (
          <>
            <CategoryRow title="🔥 En Popüler Filmler" items={mostPopular} contentType="movie" onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} />
            <CategoryRow title="⭐ En Yüksek Puanlı Filmler" items={topRated} contentType="movie" onClickItem={(item, type) => navigate(`/content/${item.id}?type=${type}`)} />
          </>
        )}
        
        {/* Arama Yapılmış ama Sonuç Bulunamamışsa */}
        {searchResults.length === 0 && searchQuery !== "" && !loading && (
             <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 20 }}>
                 Sonuç bulunamadı.
             </div>
        )}

      </div>
    </div>
  );
}