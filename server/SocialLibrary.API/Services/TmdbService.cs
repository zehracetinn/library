using Newtonsoft.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class TmdbService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public TmdbService(IConfiguration config, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = config["Tmdb:ApiKey"]!;
    }

    public async Task<Content> SearchContentAsync(string query)
    {
        var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        if (data.results == null || data.results.Count == 0)
            return new Content { Title = "No results found" };

        var item = data.results[0];

        return new Content
        {
            Id = item.id.ToString(),
            Title = item.title,
            Description = item.overview,
            Year = ((string?)item.release_date)?.Split('-')[0],
            ImageUrl = $"https://image.tmdb.org/t/p/w500{item.poster_path}"
        };
    }

    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        var url = $"https://api.themoviedb.org/3/movie/{id}?api_key={_apiKey}";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        // Genre fix (Select çalışmaz → foreach kullanılmalı)
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
            Title = data.title,
            Description = data.overview,
            Genre = genre,
            Rating = data.vote_average,
            ImageUrl = $"https://image.tmdb.org/t/p/w500{data.poster_path}"
        };
    }


        // TmdbService.cs dosyasının içine, diğer metotların altına ekle:

    public async Task<List<Content>> GetTopRatedAsync()
    {
        var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}&language=tr-TR&page=1";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        var contentList = new List<Content>();

        if (data.results != null)
        {
            foreach (var item in data.results)
            {
                contentList.Add(new Content
                {
                    Id = item.id.ToString(),
                    Title = item.title,
                    Description = item.overview,
                    Year = ((string?)item.release_date)?.Split('-')[0], // Yılı al
                    ImageUrl = item.poster_path != null 
                        ? $"https://image.tmdb.org/t/p/w500{item.poster_path}" 
                        : null,
                    // Rating eklemek istersen modeline double Rating eklemelisin
                });
            }
        }

        return contentList;
    }

    public async Task<List<Content>> GetPopularAsync()
    {
        var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}&language=tr-TR&page=1";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        var contentList = new List<Content>();

        if (data.results != null)
        {
            foreach (var item in data.results)
            {
                contentList.Add(new Content
                {
                    Id = item.id.ToString(),
                    Title = item.title,
                    Description = item.overview,
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
