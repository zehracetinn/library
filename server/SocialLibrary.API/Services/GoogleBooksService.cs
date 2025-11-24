using Newtonsoft.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class GoogleBooksService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GoogleBooksService(IConfiguration config, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = config["GoogleBooks:ApiKey"]!;
    }

    public async Task<Content> SearchContentAsync(string query)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&key={_apiKey}";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        if (data.items == null)
            return new Content { Title = "No results found" };

        var item = data.items[0];

        return new Content
        {
            Id = (string)item.id,
            Title = item.volumeInfo.title,
            Description = item.volumeInfo.description,
            Year = item.volumeInfo.publishedDate,
            ImageUrl = item.volumeInfo.imageLinks?.thumbnail
        };
    }

    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes/{id}?key={_apiKey}";
        var json = await _httpClient.GetStringAsync(url);
        dynamic data = JsonConvert.DeserializeObject(json);

        return new ContentDetail
        {
            Id = id,
            Title = data.volumeInfo.title,
            Description = data.volumeInfo.description,
            Authors = data.volumeInfo.authors != null ? string.Join(", ", data.volumeInfo.authors) : "",
            Genre = data.volumeInfo.categories != null ? string.Join(", ", data.volumeInfo.categories) : "",
            Rating = data.volumeInfo.averageRating ?? 0,
            ImageUrl = data.volumeInfo.imageLinks?.thumbnail
        };
    }
}
