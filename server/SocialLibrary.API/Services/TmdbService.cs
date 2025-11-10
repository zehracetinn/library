using Newtonsoft.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class TmdbService : IContentService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public TmdbService(IConfiguration config, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = config["Tmdb:ApiKey"]; // appsettings.json'dan alınacak
    }

    public async Task<Content> SearchContentAsync(string query, string type = "movie")
    {
    var url = $"https://api.themoviedb.org/3/search/{type}?api_key={_apiKey}&query={query}";
    var response = await _httpClient.GetStringAsync(url);
    var data = JsonConvert.DeserializeObject<dynamic>(response);

    if (data?.results == null || data.results.Count == 0)
    {
        // Eğer sonuç yoksa, uygun bir hata veya boş içerik dönebilirsiniz.
        return new Content { Title = "No results found" };
    }

    return new Content
    {
        Id = data.results[0].id,
        Title = data.results[0].title,
        Description = data.results[0].overview,
        Year = data.results[0].release_date?.ToString("yyyy"),
        ImageUrl = $"https://image.tmdb.org/t/p/w500{data.results[0].poster_path}"
    };
    }





    public async Task<ContentDetail> GetContentDetailsAsync(int contentId, string type = "movie")
    {
        var url = $"https://api.themoviedb.org/3/{type}/{contentId}?api_key={_apiKey}";
        var response = await _httpClient.GetStringAsync(url);
        var data = JsonConvert.DeserializeObject<dynamic>(response);

        return new ContentDetail
        {
            Id = contentId,
            Title = data.title,
            Description = data.overview,
            Director = data.director,
            Genre = data.genres[0].name,
            Rating = data.vote_average,
            ImageUrl = $"https://image.tmdb.org/t/p/w500{data.poster_path}"
        };
    }
}
