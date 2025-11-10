namespace SocialLibrary.API.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
}
