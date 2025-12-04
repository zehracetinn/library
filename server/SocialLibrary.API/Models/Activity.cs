namespace SocialLibrary.API.Models;

public class Activity
{
    public int Id { get; set; }

    // --- USER ---
    public int UserId { get; set; }
    public User User { get; set; } = null!;   // << EKLENDİ (zorunlu)

    // --- ACTION TYPE ---
    public string ActionType { get; set; } = "";  
    // "rating", "review", "status", "favorite"

    // --- CONTENT INFO ---
    public string ContentId { get; set; } = "";
    public string Type { get; set; } = "";   
    // "movie" / "book"

    public string? Title { get; set; }
    public string? ImageUrl { get; set; }

    // --- RATING / STATUS / REVIEW ---
    public int? Score { get; set; }           
    public string? Status { get; set; }       
    public string? Snippet { get; set; }      

    // --- META ---
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- LIKE RELATION ---
    public ICollection<ActivityLike> Likes { get; set; } = new List<ActivityLike>();
}
