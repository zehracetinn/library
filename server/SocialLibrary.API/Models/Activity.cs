namespace SocialLibrary.API.Models;

public class Activity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string ActionType { get; set; } = "";  
    // "rating", "review", "status", "favorite"

    public string ContentId { get; set; } = "";
    public string Type { get; set; } = "";        // "movie" / "book"

    public string? Title { get; set; }
    public string? ImageUrl { get; set; }

    public int? Score { get; set; }               // rating için
    public string? Status { get; set; }           // watched/toWatch/read/toRead
    public string? Snippet { get; set; }          // yorumdan kısa bir özet

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
