using Newtonsoft.Json;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class GoogleBooksService
{
    private readonly HttpClient _httpClient;

    public GoogleBooksService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // --- LİSTE ARAMA ---
    public async Task<List<Content>> SearchContentListAsync(string query)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&maxResults=20&printType=books";

        using var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return new List<Content>();
        }

        var json = await response.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(json);

        var results = new List<Content>();

        if (data?.items == null) return results;

        foreach (var item in data.items)
        {
            dynamic volume = item.volumeInfo;

            string? year = null;
            if (volume?.publishedDate != null)
            {
                string pd = (string)volume.publishedDate;
                year = pd.Split('-')[0];
            }

            string? imageUrl = null;
            if (volume?.imageLinks != null && volume.imageLinks.thumbnail != null)
            {
                imageUrl = (string)volume.imageLinks.thumbnail;
                imageUrl = imageUrl.Replace("http://", "https://");
            }

            results.Add(new Content
            {
                Id = (string)item.id,
                Title = volume?.title,
                Description = volume?.description,
                Year = year,
                ImageUrl = imageUrl,
                Type = "book" // Frontend için gerekli
            });
        }
        return results;
    }

    // --- DETAY GETİRME ---
    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes/{id}";

        using var response = await _httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return new ContentDetail { Id = id, Title = "Kitap Bulunamadı", Type = "book" };

        var json = await response.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(json);

        string? imageUrl = null;
        if (data.volumeInfo?.imageLinks != null && data.volumeInfo.imageLinks.thumbnail != null)
        {
            imageUrl = (string)data.volumeInfo.imageLinks.thumbnail;
            imageUrl = imageUrl.Replace("http://", "https://");
        }

        string authors = "";
        if (data.volumeInfo?.authors != null)
        {
            authors = string.Join(", ", data.volumeInfo.authors.ToObject<List<string>>());
        }

        string categories = "";
        if (data.volumeInfo?.categories != null)
        {
            categories = string.Join(", ", data.volumeInfo.categories.ToObject<List<string>>());
        }

        return new ContentDetail
        {
            Id = id,
            Title = data.volumeInfo.title,
            Description = data.volumeInfo.description,
            Authors = authors,
            Genre = categories,
            Rating = data.volumeInfo.averageRating ?? 0,
            ImageUrl = imageUrl,
            Year = data.volumeInfo?.publishedDate != null ? ((string)data.volumeInfo.publishedDate).Split('-')[0] : "",
            Type = "book"
        };
    }
}