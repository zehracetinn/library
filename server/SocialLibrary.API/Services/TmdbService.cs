using System.Text.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class TmdbService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private const string BaseUrl = "https://api.themoviedb.org/3";

    public TmdbService(HttpClient http, IConfiguration config)
    {
        _http = http;
        // Config'den okumaya çalış, yoksa hardcoded fallback kullan (Hata almamak için)
        _apiKey = config["Tmdb:ApiKey"] ?? "d39ac8932db698305eb5520a06282869";
    }

    // =====================================================================
    // 1) ARAMA 
    // =====================================================================
    public async Task<List<Content>> SearchContentListAsync(string query)
    {
        var url = $"{BaseUrl}/search/movie?api_key={_apiKey}&language=tr-TR&query={Uri.EscapeDataString(query)}";
        var res = await _http.GetStringAsync(url);
        using var doc = JsonDocument.Parse(res);
        
        var list = new List<Content>();
        if (doc.RootElement.TryGetProperty("results", out var results))
        {
            foreach (var item in results.EnumerateArray())
            {
                list.Add(MapToContent(item));
            }
        }
        return list;
    }

    // =====================================================================
    // 2) DETAY
    // =====================================================================
    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        // append_to_response=credits sayesinde Yönetmen bilgisini de tek seferde çekiyoruz
        var url = $"{BaseUrl}/movie/{id}?api_key={_apiKey}&language=tr-TR&append_to_response=credits";
        
        try 
        {
            var res = await _http.GetStringAsync(url);
            using var doc = JsonDocument.Parse(res);
            var root = doc.RootElement;

            return new ContentDetail
            {
                Id = root.GetProperty("id").ToString(),
                Title = root.GetProperty("title").GetString() ?? "",
                Description = root.GetProperty("overview").GetString() ?? "",
                // Poster kontrolü
                ImageUrl = root.TryGetProperty("poster_path", out var p) && p.GetString() != null 
                    ? $"https://image.tmdb.org/t/p/w500{p.GetString()}" 
                    : null,
                // Yıl kontrolü (YYYY-MM-DD formatından sadece yılı al)
                Year = root.TryGetProperty("release_date", out var d) && d.GetString()?.Length >= 4 
                    ? d.GetString()![..4] 
                    : "",
                // Yönetmen ve Türleri al
                Director = GetDirector(root),
                Genre = GetGenres(root),
                Rating = root.TryGetProperty("vote_average", out var v) ? v.GetDouble() : 0
            };
        }
        catch
        {
            // Hata durumunda boş veya null dönebiliriz, şimdilik basit tutalım
            return new ContentDetail { Id = id, Title = "Bulunamadı" };
        }
    }

    // =====================================================================
    // 3) POPÜLER FİLMLER (DiscoverController İçin)
    // =====================================================================
    public async Task<List<Content>> GetPopularMoviesAsync()
    {
        var url = $"{BaseUrl}/movie/popular?api_key={_apiKey}&language=tr-TR&page=1";
        var res = await _http.GetStringAsync(url);
        using var doc = JsonDocument.Parse(res);

        var list = new List<Content>();
        if (doc.RootElement.TryGetProperty("results", out var results))
        {
            foreach (var item in results.EnumerateArray())
            {
                list.Add(MapToContent(item));
            }
        }
        return list;
    }

    // --- Yardımcı Metodlar (Parsing) ---

    // JSON'dan Content nesnesi oluşturur
    private Content MapToContent(JsonElement item)
    {
        return new Content
        {
            Id = item.GetProperty("id").ToString(),
            Title = item.GetProperty("title").GetString() ?? "",
            ImageUrl = item.TryGetProperty("poster_path", out var p) && p.GetString() != null
                ? $"https://image.tmdb.org/t/p/w500{p.GetString()}"
                : null,
            Description = item.TryGetProperty("overview", out var o) ? o.GetString() : "",
            Type = "movie" // ✅ Frontend'in link oluşturması için bu alan zorunlu
        };
    }

    // Credits içinden Yönetmeni bulur
    private string GetDirector(JsonElement root)
    {
        if (root.TryGetProperty("credits", out var credits) && credits.TryGetProperty("crew", out var crew))
        {
            foreach (var person in crew.EnumerateArray())
            {
                if (person.TryGetProperty("job", out var job) && job.GetString() == "Director")
                {
                    return person.GetProperty("name").GetString() ?? "";
                }
            }
        }
        return "";
    }

    // Türleri virgülle ayrılmış string yapar
    private string GetGenres(JsonElement root)
    {
        if (root.TryGetProperty("genres", out var genres))
        {
            var list = new List<string>();
            foreach (var g in genres.EnumerateArray())
            {
                list.Add(g.GetProperty("name").GetString() ?? "");
            }
            return string.Join(", ", list);
        }
        return "";
    }
}