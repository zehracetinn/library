using SocialLibrary.API.Models;

namespace SocialLibrary.API.Services;

public interface ITokenService
{
    (string token, DateTime expiresAt) CreateToken(User user);
}
