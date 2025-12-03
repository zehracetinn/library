using System.Text.Json.Serialization;

namespace SocialLibrary.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // ✅ EKSİK OLAN ALANLARI BURAYA EKLİYORUZ
    public string? Bio { get; set; }       // Biyografi (Boş olabilir)
    public string? AvatarUrl { get; set; } // Profil Resmi (Boş olabilir)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // İlişkiler (Navigation Properties)
    [JsonIgnore]
    public List<Rating> Ratings { get; set; } = new();

    [JsonIgnore]
    public List<Review> Reviews { get; set; } = new();

    [JsonIgnore]
    public List<UserContent> UserContents { get; set; } = new();
}