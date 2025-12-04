using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;
using SocialLibrary.API.DTOs;
using SocialLibrary.API.Models;
using SocialLibrary.API.Services;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService; // 🔥 Şifre sıfırlama için e-mail servisi

    public AuthController(AppDbContext db, ITokenService tokenService, IEmailService emailService)
    {
        _db = db;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    // --------------------------------------------------------------------
    // ▶ 1) REGISTER (Kayıt Ol)
    // --------------------------------------------------------------------
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Username, email ve password zorunludur.");

        var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email || u.Username == dto.Username);
        if (exists) return Conflict("Bu kullanıcı adı veya e-posta zaten kullanımda.");

        var user = new User
        {
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (token, expires) = _tokenService.CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expires,
            Username = user.Username,
            Email = user.Email
        });
    }

    // --------------------------------------------------------------------
    // ▶ 2) LOGIN (Giriş Yap)
    // --------------------------------------------------------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user is null)
            return Unauthorized("E-posta veya şifre hatalı.");

        var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!ok)
            return Unauthorized("E-posta veya şifre hatalı.");

        var (token, expires) = _tokenService.CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expires,
            Username = user.Username,
            Email = user.Email
        });
    }

    // --------------------------------------------------------------------
    // ▶ 3) ŞİFREMİ UNUTTUM → Reset Linki Gönder
    // --------------------------------------------------------------------
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user is null)
            return Ok(); 
        // Güvenlik için "Böyle bir mail yok" demiyoruz.

        // Token oluştur
        string resetToken = Guid.NewGuid().ToString("N");

        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);

        await _db.SaveChangesAsync();

        // 🔥 Mail gönder
        var url = $"https://your-frontend.com/reset-password/{resetToken}";
        await _emailService.SendAsync(user.Email, "Şifre Sıfırlama", $"Şifreni sıfırlamak için link: {url}");

        return Ok("Şifre sıfırlama e-postası gönderildi.");
    }

    // --------------------------------------------------------------------
    // ▶ 4) Şifre Sıfırlama Onayı (Yeni Şifre Kaydet)
    // --------------------------------------------------------------------
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == dto.Token &&
            u.PasswordResetTokenExpires > DateTime.UtcNow);

        if (user is null)
            return BadRequest("Token geçersiz veya süresi dolmuş.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpires = null;

        await _db.SaveChangesAsync();

        return Ok("Şifre başarıyla yenilendi.");
    }
}
