using Newtonsoft.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class GoogleBooksService : IContentService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GoogleBooksService(IConfiguration config, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = config["GoogleBooks:ApiKey"]; // appsettings.json'dan alınacak
    }

    public async Task<Content> SearchContentAsync(string query, string type = "book")
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


    public async Task<ContentDetail> GetContentDetailsAsync(int contentId, string type = "book")
    {
        var url = $"https://www.googleapis.com/books/v1/volumes/{contentId}?key={_apiKey}";
        var response = await _httpClient.GetStringAsync(url);
        var data = JsonConvert.DeserializeObject<dynamic>(response);

        return new ContentDetail
        {
            Id = contentId,
            Title = data.volumeInfo.title,
            Description = data.volumeInfo.description,
            Authors = string.Join(", ", data.volumeInfo.authors),
            Genre = string.Join(", ", data.volumeInfo.categories),
            Rating = data.volumeInfo.averageRating ?? 0,
            ImageUrl = data.volumeInfo.imageLinks?.thumbnail
        };
    }
}
