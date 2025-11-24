namespace SocialLibrary.API.Models;

public class Rating
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string ContentId { get; set; } = "";   // TMDb id veya Google Books id
    public string Type { get; set; } = "";        // "movie" veya "book"

    public int Score { get; set; }               // 1–10 arası
    public DateTime RatedAt { get; set; } = DateTime.UtcNow;
}
