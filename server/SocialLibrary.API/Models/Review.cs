namespace SocialLibrary.API.Models;

public class Review
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string ContentId { get; set; } = "";
    public string Type { get; set; } = "";       // movie/book

    public string Text { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
