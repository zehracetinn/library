using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // _context için gerekli
using SocialLibrary.API.Data;        // AppDbContext için gerekli
using SocialLibrary.API.Services;    // IEmailService ve ITokenService için gerekli
using SocialLibrary.API.Models;      // User modeli için
using SocialLibrary.API.DTOs;        // DTO'lar için (Eğer ayrı klasördeyse)

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // 1. Alanları Tanımlıyoruz
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService; // <-- Bunu eklemeyi unutmuşsun

    // 2. Constructor (Kurucu Metot) - Hepsini içeri alıyoruz
    public AuthController(AppDbContext context, ITokenService tokenService, IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    // --- REGISTER (KAYIT) ---
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Bu e-posta zaten kayıtlı.");

        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("Bu kullanıcı adı zaten alınmış.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            // Şifreyi hash'lemek gerekir, şimdilik düz kaydediyoruz (Geliştirme aşaması)
            PasswordHash = dto.Password 
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı!" });
    }

    // --- LOGIN (GİRİŞ) ---
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || user.PasswordHash != dto.Password) // Hash kontrolü burada yapılmalı
            return Unauthorized("Geçersiz e-posta veya şifre.");

        var token = _tokenService.CreateToken(user);

        return Ok(new 
        { 
            token = token, 
            userId = user.Id, 
            username = user.Username,
            avatarUrl = user.AvatarUrl
        });
    }

    // --- ŞİFREMİ UNUTTUM ---
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        // Kullanıcı yoksa bile güvenlik gereği "gönderildi" diyoruz
        if (user == null) 
        {
            return Ok(new { message = "Eğer kayıtlıysa, şifre sıfırlama linki gönderildi." }); 
        }

        // Token oluştur
        var token = Guid.NewGuid().ToString();
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync();

        // Mail Gönderme İşlemi (Hata yakalamalı)
        try 
        {
            var resetLink = $"http://localhost:5173/reset-password?token={token}";
            var body = $"<h3>Şifre Sıfırlama</h3><p>Şifrenizi sıfırlamak için <a href='{resetLink}'>tıklayınız</a>.</p>";
            
            await _emailService.SendEmailAsync(user.Email, "Şifre Sıfırlama Talebi", body);
            
            return Ok(new { message = "E-posta başarıyla gönderildi." });
        }
        catch (Exception ex)
        {
            // Hata olursa konsola yazdır ve frontend'e hatayı dön
            Console.WriteLine("MAIL HATASI: " + ex.Message);
            // Inner exception varsa onu da görelim (Genelde asıl sebep buradadır)
            if (ex.InnerException != null) 
            {
                Console.WriteLine("DETAY: " + ex.InnerException.Message);
            }

            return BadRequest(new { message = "Mail gönderilemedi. Sunucu hatası: " + ex.Message });
        }
    }

    // --- ŞİFRE SIFIRLAMA ---
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == dto.Token);

        if (user == null || user.PasswordResetTokenExpires < DateTime.UtcNow)
        {
            return BadRequest("Geçersiz veya süresi dolmuş token.");
        }

        // Yeni şifreyi kaydet
        user.PasswordHash = dto.NewPassword;
        
        // Token'ı temizle
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpires = null;
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Şifre başarıyla güncellendi." });
    }
}

// --- DTO TANIMLARI (Eğer ayrı dosyada değillerse buraya koyabilirsin) ---
// NOT: Ayrı dosyadaysalar (DTOs klasörü), buradaki class'ları silebilirsin.
public class RegisterDto { public string Username { get; set; } = ""; public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class LoginDto { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class ForgotPasswordDto { public string Email { get; set; } = ""; }
public class ResetPasswordDto { public string Token { get; set; } = ""; public string NewPassword { get; set; } = ""; }