using System.Net.Http.Headers;
using System.Text.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class TmdbService
{
    private readonly HttpClient _http;
    private const string BaseUrl = "https://api.themoviedb.org/3";

    public TmdbService(HttpClient http, IConfiguration config)
    {
        _http = http;
        
        // 1. ADIM: Access Token'ı alıyoruz
        var accessToken = config["Tmdb:ReadAccessToken"];

        // Eğer Token yoksa console'a uyarı bas
        if (string.IsNullOrEmpty(accessToken))
        {
            Console.WriteLine("UYARI: TMDB ReadAccessToken bulunamadı! İstekler başarısız olabilir.");
        }
        else
        {
            // 2. ADIM: Authorization Header'ı ekliyoruz (En güvenli yöntem)
            _http.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", accessToken);
        }
    }

    // =====================================================================
    // 1) ARAMA VE FİLTRELEME
    // =====================================================================
    public async Task<List<Content>> SearchMoviesAsync(string query, string? genre = null, int? year = null, double? rating = null)
    {
        string url;

        // Not: Artık URL'lere "?api_key=..." EKLEMİYORUZ. Header kullanıyoruz.
        if (!string.IsNullOrWhiteSpace(query))
        {
            url = $"{BaseUrl}/search/movie?language=tr-TR&query={Uri.EscapeDataString(query)}";
        }
        else
        {
            url = $"{BaseUrl}/discover/movie?language=tr-TR&sort_by=popularity.desc";
        }

        // --- FİLTRELER ---
        if (year.HasValue && year > 1900) url += $"&primary_release_year={year}";
        if (rating.HasValue && rating > 0) url += $"&vote_average.gte={rating}";

        return await FetchListAsync(url);
    }

    public async Task<List<Content>> SearchContentListAsync(string query) => await SearchMoviesAsync(query);

    // =====================================================================
    // 2) DETAY
    // =====================================================================
    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        var url = $"{BaseUrl}/movie/{id}?language=tr-TR&append_to_response=credits";
        try 
        {
            var res = await _http.GetStringAsync(url);
            using var doc = JsonDocument.Parse(res);
            var root = doc.RootElement;

            return new ContentDetail
            {
                Id = root.GetProperty("id").ToString(),
                Title = root.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                Description = root.TryGetProperty("overview", out var ov) ? ov.GetString() ?? "" : "",
                ImageUrl = root.TryGetProperty("poster_path", out var p) && p.GetString() != null 
                    ? $"https://image.tmdb.org/t/p/w500{p.GetString()}" : null,
                Year = root.TryGetProperty("release_date", out var d) && d.GetString()?.Length >= 4 
                    ? d.GetString()![..4] : "",
                Director = GetDirector(root),
                Genre = GetGenres(root),
                Rating = root.TryGetProperty("vote_average", out var v) ? v.GetDouble() : 0
            };
        }
        catch (Exception ex)
        { 
            Console.WriteLine($"TMDB Detay Hatası ({id}): {ex.Message}");
            return new ContentDetail { Id = id, Title = "Bulunamadı" }; 
        }
    }

    // =====================================================================
    // 3) POPÜLER & TOP RATED
    // =====================================================================
    public async Task<List<Content>> GetPopularAsync()
    {
        // api_key parametresini kaldırdık
        var url = $"{BaseUrl}/movie/popular?language=tr-TR&page=1";
        return await FetchListAsync(url);
    }

    public async Task<List<Content>> GetTopRatedAsync()
    {
        // api_key parametresini kaldırdık
        var url = $"{BaseUrl}/movie/top_rated?language=tr-TR&page=1";
        return await FetchListAsync(url);
    }
    
    public async Task<List<Content>> GetPopularMoviesAsync() => await GetPopularAsync();

    // =====================================================================
    // YARDIMCI METOTLAR (GELİŞMİŞ HATA YÖNETİMİ)
    // =====================================================================
    
    private async Task<List<Content>> FetchListAsync(string url)
    {
        try
        {
            // GetStringAsync yerine doğrudan response kontrolü yapıyoruz
            var response = await _http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                // HATA VARSA DETAYINI GÖR
                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"🔴 TMDB API HATASI!");
                Console.WriteLine($"   Durum Kodu: {response.StatusCode}");
                Console.WriteLine($"   URL: {url}");
                Console.WriteLine($"   Mesaj: {errorBody}");
                return new List<Content>();
            }

            var res = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(res);
            var list = new List<Content>();
            
            if (doc.RootElement.TryGetProperty("results", out var results))
            {
                foreach (var item in results.EnumerateArray())
                {
                    list.Add(MapToContent(item));
                }
            }
            // Başarılı olursa yeşil yazalım
            Console.WriteLine($"🟢 TMDB Verisi Çekildi: {list.Count} adet. ({url})");
            return list;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"🔴 KRİTİK HATA (FetchListAsync): {ex.Message}");
            return new List<Content>();
        }
    }

    private Content MapToContent(JsonElement item)
    {
        return new Content
        {
            Id = item.GetProperty("id").ToString(),
            Title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
            ImageUrl = item.TryGetProperty("poster_path", out var p) && p.GetString() != null
                ? $"https://image.tmdb.org/t/p/w500{p.GetString()}" : null,
            Description = item.TryGetProperty("overview", out var o) ? o.GetString() : "",
            Type = "movie"
        };
    }

    private string GetDirector(JsonElement root)
    {
        if (root.TryGetProperty("credits", out var credits) && credits.TryGetProperty("crew", out var crew))
        {
            foreach (var person in crew.EnumerateArray())
            {
                if (person.TryGetProperty("job", out var job) && job.GetString() == "Director")
                {
                    return person.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                }
            }
        }
        return "";
    }

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