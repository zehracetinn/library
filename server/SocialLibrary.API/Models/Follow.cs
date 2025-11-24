namespace SocialLibrary.API.Models;

public class Follow
{
    public int Id { get; set; }

    public int FollowerId { get; set; }   // Takip eden
    public int FollowedId { get; set; }   // Takip edilen

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
