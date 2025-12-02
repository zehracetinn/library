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

    // --- 1) BİR TANE İÇİN (Eski kullanım) ---
    public async Task<Content> SearchContentAsync(string query)
    {
        var list = await SearchContentListAsync(query);

        if (list.Count == 0)
            return new Content { Title = "No results found" };

        return list[0];
    }

    // --- 2) LISTE OLARAK DÖNEN YENİ METOT ---
    public async Task<List<Content>> SearchContentListAsync(string query)
    {
        var url =
            $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&maxResults=20";

        using var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            // Google tarafı 400/403 vs dönerse API’n Biz 500 atmayalım.
            return new List<Content>();
        }

        var json = await response.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(json);

        var results = new List<Content>();

        if (data?.items == null)
            return results;

        foreach (var item in data.items)
        {
            dynamic volume = item.volumeInfo;

            // publishedDate bazen "1997", bazen "1997-06-26" geliyor
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
            }

            results.Add(new Content
            {
                Id = (string)item.id,
                Title = volume?.title,
                Description = volume?.description,
                Year = year,
                ImageUrl = imageUrl
            });
        }

        return results;
    }

    // --- 3) DETAY ---
    public async Task<ContentDetail> GetContentDetailsAsync(string id)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes/{id}";

        using var response = await _httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            throw new Exception("Google Books error: " + response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(json);

        string? imageUrl = null;
        if (data.volumeInfo?.imageLinks != null && data.volumeInfo.imageLinks.thumbnail != null)
        {
            imageUrl = (string)data.volumeInfo.imageLinks.thumbnail;
        }

        return new ContentDetail
        {
            Id = id,
            Title = data.volumeInfo.title,
            Description = data.volumeInfo.description,
            Authors = data.volumeInfo.authors != null
                ? string.Join(", ", data.volumeInfo.authors)
                : "",
            Genre = data.volumeInfo.categories != null
                ? string.Join(", ", data.volumeInfo.categories)
                : "",
            Rating = data.volumeInfo.averageRating ?? 0,
            ImageUrl = imageUrl
        };
    }
}
