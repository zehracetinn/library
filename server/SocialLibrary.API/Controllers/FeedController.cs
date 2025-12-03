using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/feed
    [HttpGet]
    [AllowAnonymous] // Test aşamasında token derdi olmasın diye
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        // 1. Sorguyu Hazırla (Şimdilik Global Akış - Herkesi Göster)
        // İlerde buraya .Where(a => followingIds.Contains(a.UserId)) ekleyerek filtreleyebilirsin.
        var query = _db.Activities
            .OrderByDescending(a => a.Id); // En yeniden eskiye

        // 2. Frontend'in beklediği formata dönüştür (Projection)
        var activities = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new 
            {
                a.Id,
                a.ActionType, // "rating", "review", "status"
                a.CreatedAt,
                
                // Frontend'deki ActivityCard.tsx bu yapıyı bekliyor:
                Content = new {
                    Id = a.ContentId,
                    Type = a.Type,
                    Title = a.Title,
                    ImageUrl = a.ImageUrl
                },

                // Kullanıcı ismini çekmek için:
                User = _db.Users
                    .Where(u => u.Id == a.UserId)
                    .Select(u => new { u.Id, u.Username })
                    .FirstOrDefault(),

                // Detaylar
                a.Score,
                a.Status,
                a.Snippet
            })
            .ToListAsync();

        // Frontend şu an direkt liste beklediği için (res.data.map...),
        // objeye sarmadan direkt listeyi dönüyoruz.
        return Ok(activities);
    }
}