using System.Text.Json.Serialization;

namespace SocialLibrary.API.Models;

public class CustomListItem
{
    public int Id { get; set; }
    public int CustomListId { get; set; } // Hangi listeye ait?
    
    // İçerik Bilgileri (Hızlı erişim için başlık ve resmi burada da tutuyoruz)
    public string ContentId { get; set; } = "";
    public string Type { get; set; } = ""; // movie veya book
    public string Title { get; set; } = "";
    public string? ImageUrl { get; set; }
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public CustomList CustomList { get; set; }
}