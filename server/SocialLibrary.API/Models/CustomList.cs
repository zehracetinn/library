using System.Text.Json.Serialization;

namespace SocialLibrary.API.Models;

public class CustomList
{
    public int Id { get; set; }
    public string Name { get; set; } = ""; // Liste Adı (örn: "En İyi Korku Filmleri")
    public int UserId { get; set; }        // Listeyi oluşturan kullanıcı
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Bir listenin birden çok elemanı olabilir
    public List<CustomListItem> Items { get; set; } = new();
}