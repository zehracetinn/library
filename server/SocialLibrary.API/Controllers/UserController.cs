using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;
using System.Security.Claims;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    // 1. PROFİL BİLGİLERİ + İSTATİSTİKLER + SON AKTİVİTELER
    // GET: api/User/profile/{userId}
    [HttpGet("profile/{userId}")]
    [AllowAnonymous] // Giriş yapmayanlar da profil görebilsin
    public async Task<IActionResult> GetProfile(int userId)
    {
        // A. Kullanıcıyı Bul
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        // B. İstatistikler (Takipçi / Takip Edilen)
        var followersCount = await _db.Follows.CountAsync(f => f.FollowedId == userId);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == userId);

        // C. Ziyaretçi Kim? (Ben miyim? Takip ediyor muyum?)
        bool isSelf = false;
        bool isFollowing = false;
        
        // Token varsa, giriş yapan kullanıcıyı kontrol et
        var currentUserIdStr = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserIdStr != null)
        {
            int currentId = int.Parse(currentUserIdStr);
            isSelf = (currentId == userId);
            
            if (!isSelf)
            {
                isFollowing = await _db.Follows.AnyAsync(f => f.FollowerId == currentId && f.FollowedId == userId);
            }
        }

        // D. Bu Kullanıcının Son Aktiviteleri (Profile özel feed)
        var activities = await _db.Activities
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10) // Profilde sadece son 10 hareketi gösterelim
            .Select(a => new 
            {
                a.Id,
                a.ActionType,
                a.CreatedAt,
                Content = new {
                    Id = a.ContentId,
                    Type = a.Type,
                    Title = a.Title,
                    ImageUrl = a.ImageUrl
                },
                User = new { user.Id, user.Username }, 
                a.Score,
                a.Status,
                a.Snippet
            })
            .ToListAsync();

        // E. Hepsini Tek Pakette Dön
        return Ok(new 
        {
            User = new { user.Id, user.Username, user.Bio, user.AvatarUrl },
            Stats = new { followersCount, followingCount },
            IsSelf = isSelf,
            IsFollowing = isFollowing,
            Activities = activities
        });
    }

    // 2. KÜTÜPHANE İÇERİĞİ (Sekmeler İçin)
    // GET: api/User/library/{userId}
    [HttpGet("library/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLibrary(int userId)
    {
        // Kullanıcının tüm içeriklerini çek
        var allItems = await _db.UserContents
            .Where(uc => uc.UserId == userId)
            .OrderByDescending(uc => uc.SavedAt)
            .ToListAsync();

        // Frontend'in kolay kullanması için grupluyoruz
        return Ok(new
        {
            watched = allItems.Where(x => x.Status == "watched"),
            toWatch = allItems.Where(x => x.Status == "toWatch"),
            read = allItems.Where(x => x.Status == "read"),
            toRead = allItems.Where(x => x.Status == "toRead")
        });
    }

    // 3. PROFİL DÜZENLEME (Bio / Avatar)
    // PUT: api/User/update
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        
        if (user == null) return NotFound();

        // Sadece dolu gelen alanları güncelle
        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;

        await _db.SaveChangesAsync();
        return Ok(user);
    }
}

// Veri Transfer Modeli
public class UpdateProfileDto 
{
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}