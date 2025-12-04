using System.Text.Json.Serialization;

namespace SocialLibrary.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public ICollection<Activity> Activities { get; set; } = new List<Activity>();



    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpires { get; set; }


    // ✅ EKSİK OLAN ALANLARI BURAYA EKLİYORUZ
    public string? Bio { get; set; }       // Biyografi (Boş olabilir)
    public string? AvatarUrl { get; set; } // Profil Resmi (Boş olabilir)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


     // Takipçi sayısı (eklenen özellik)
        public int FollowersCount { get; set; } = 0;

        // Takip edilen sayısı (eklenen özellik)
        public int FollowingCount { get; set; } = 0;


       

    // İlişkiler (Navigation Properties)
    [JsonIgnore]
    public List<Rating> Ratings { get; set; } = new();

    [JsonIgnore]
    public List<Review> Reviews { get; set; } = new();

    [JsonIgnore]
    public List<UserContent> UserContents { get; set; } = new();
}