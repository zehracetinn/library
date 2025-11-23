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
        _apiKey = config["GoogleBooks:ApiKey"]; // appsettings.json'dan API anahtarını alıyoruz
    }

    public async Task<Content> SearchContentAsync(string query, string type = "book")
    {
        var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&key={_apiKey}";

        var response = await _httpClient.GetStringAsync(url);
        var data = JsonConvert.DeserializeObject<dynamic>(response);

        if (data?.items == null || data.items.Count == 0)
        {
            // Eğer sonuç yoksa, uygun bir hata veya boş içerik dönebilirsiniz.
            return new Content { Title = "No results found" };
        }

        return new Content
        {
            Id = data.items[0].id,
            Title = data.items[0].volumeInfo.title,
            Description = data.items[0].volumeInfo.description,
            Year = data.items[0].volumeInfo.publishedDate?.ToString("yyyy"),
            ImageUrl = data.items[0].volumeInfo.imageLinks?.thumbnail
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
