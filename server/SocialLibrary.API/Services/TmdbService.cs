using Newtonsoft.Json;
using SocialLibrary.API.Models;
using System.Net.Http.Headers;

namespace SocialLibrary.API.Services;

public class TmdbService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _readAccessToken;

    public TmdbService(IConfiguration config, HttpClient httpClient)
    {
        _httpClient = httpClient;

        _apiKey = config["Tmdb:ApiKey"]
                  ?? throw new InvalidOperationException("Tmdb:ApiKey appsettings.json içinde tanımlı değil.");

        _readAccessToken = config["Tmdb:ReadAccessToken"]
                  ?? throw new InvalidOperationException("Tmdb:ReadAccessToken appsettings.json içinde tanımlı değil.");

        // TMDB v4 için Bearer token
        if (_httpClient.DefaultRequestHeaders.Authorization == null)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _readAccessToken);
        }
    }

    // Ortak GET helper
    private async Task<dynamic?> GetAsync(string url)
    {
        var json = await _httpClient.GetStringAsync(url);
        return JsonConvert.DeserializeObject(json);
    }

    // =====================================================================
    // 1) ARAMA  (DÜZELTİLDİ: Metot adı SearchContentListAsync yapıldı)
    // =====================================================================
    public async Task<List<Content>> SearchContentListAsync(string query)
    {
        var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}";
        
        // Null kontrolü ile güvenli hale getirildi
        dynamic? data = await GetAsync(url);
        var results = new List<Content>();

        if (data == null || data.results == null)
            return results;

        foreach (var item in data.results)
        {
            results.Add(new Content
            {
                Id = item.id.ToString(),
                Title = (string?)item.title ?? "",
                Description = (string?)item.overview ?? "",
                Year = ((string?)item.release_date)?.Split('-')[0],
                ImageUrl = item.poster_path != null
                    ? $"https://image.tmdb.org/t/p/w500{item.poster_path}"
                    : null
            });
        }

        return results;
    }

    // =====================================================================
    // 2) DETAY
    // =====================================================================
    public async Task<ContentDetail?> GetContentDetailsAsync(string id)
    {
        var url = $"https://api.themoviedb.org/3/movie/{id}?api_key={_apiKey}&language=tr-TR";

        dynamic? data = await GetAsync(url);
        
        if (data == null) return null;

        string genre = "";

        if (data.genres != null)
        {
            foreach (var g in data.genres)
                genre += (string)g.name + ", ";

            if (genre.EndsWith(", "))
                genre = genre[..^2];
        }

        return new ContentDetail
        {
            Id = id,
            Title = (string?)data.title ?? "",
            Description = (string?)data.overview ?? "",
            Genre = genre,
            Rating = (double?)data.vote_average ?? 0,
            ImageUrl = data.poster_path != null
                ? $"https://image.tmdb.org/t/p/w500{data.poster_path}"
                : null
        };
    }

    // =====================================================================
    // 3) EN YÜKSEK PUANLILAR
    // =====================================================================
    public async Task<List<Content>> GetTopRatedAsync()
    {
        var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}&language=tr-TR&page=1";

        dynamic? data = await GetAsync(url);
        var contentList = new List<Content>();

        if (data != null && data.results != null)
        {
            foreach (var item in data.results)
            {
                contentList.Add(new Content
                {
                    Id = item.id.ToString(),
                    Title = (string?)item.title ?? "",
                    Description = (string?)item.overview ?? "",
                    Year = ((string?)item.release_date)?.Split('-')[0],
                    ImageUrl = item.poster_path != null
                        ? $"https://image.tmdb.org/t/p/w500{item.poster_path}"
                        : null
                });
            }
        }

        return contentList;
    }

    // =====================================================================
    // 4) EN POPÜLERLER
    // =====================================================================
    public async Task<List<Content>> GetPopularAsync()
    {
        var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}&language=tr-TR&page=1";

        dynamic? data = await GetAsync(url);
        var contentList = new List<Content>();

        if (data != null && data.results != null)
        {
            foreach (var item in data.results)
            {
                contentList.Add(new Content
                {
                    Id = item.id.ToString(),
                    Title = (string?)item.title ?? "",
                    Description = (string?)item.overview ?? "",
                    Year = ((string?)item.release_date)?.Split('-')[0],
                    ImageUrl = item.poster_path != null
                        ? $"https://image.tmdb.org/t/p/w500{item.poster_path}"
                        : null
                });
            }
        }

        return contentList;
    }
}