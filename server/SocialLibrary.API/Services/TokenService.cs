using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiresAt) CreateToken(User user)
    {
        var issuer   = _config["Jwt:Issuer"]!;
        var audience = _config["Jwt:Audience"]!;
        var key      = _config["Jwt:Key"]!;
        var minutes  = int.Parse(_config["Jwt:DurationInMinutes"] ?? "120");

        var expires  = DateTime.UtcNow.AddMinutes(minutes);

        var claims = new List<Claim>
        {
            new Claim("id", user.Id.ToString()),                // 🔥 FAVORİLER İÇİN GEREKLİ
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return (jwt, expires);
    }
}
