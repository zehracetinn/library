using System.ComponentModel.DataAnnotations.Schema;

namespace SocialLibrary.API.Models;

public class UserContent
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string ContentId { get; set; } = ""; // movie: integer ID, book: string ID

    public string Title { get; set; } = "";
    public string? ImageUrl { get; set; }
    public string? Type { get; set; } // "movie" veya "book"

    public string? Status { get; set; }   // "watched", "toWatch", "read", "toRead"

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

}
