using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;
using SocialLibrary.API.Services;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TmdbService _tmdbService;

    public ReviewsController(AppDbContext db, TmdbService tmdbService)
    {
        _db = db;
        _tmdbService = tmdbService;
    }

    // İçeriğe ait yorumları listele
    [HttpGet("content/{contentId}")]
    [AllowAnonymous]
    public IActionResult GetForContent(string contentId, [FromQuery] string type)
    {
        // Burada JOIN işlemi yaparak kullanıcı adını da çekiyoruz (varsa User tablosundan)
        var reviews = _db.Reviews
            .Where(r => r.ContentId == contentId && r.Type == type)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new 
            {
                r.Id,
                r.UserId,
                Username = _db.Users.Where(u => u.Id == r.UserId).Select(u => u.Username).FirstOrDefault() ?? "Kullanıcı",
                r.Text,
                r.CreatedAt
            })
            .ToList();

        return Ok(reviews);
    }

    public class AddReviewRequest
    {
        public string ContentId { get; set; } = "";
        public string Type { get; set; } = "";
        public string Text { get; set; } = "";
    }

    // Yorum ekle
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Add([FromBody] AddReviewRequest req)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        // ---------------------------------------------------------
        // 1. ADIM: İÇERİK KONTROLÜ
        // ---------------------------------------------------------
        var contentExists = _db.Contents.Any(c => c.Id == req.ContentId);
        if (!contentExists)
        {
            if (req.Type == "movie")
            {
                try 
                {
                    var tmdbContent = await _tmdbService.GetContentDetailsAsync(req.ContentId);
                    var newContent = new Content
                    {
                        Id = tmdbContent.Id,
                        Title = tmdbContent.Title,
                        Description = tmdbContent.Description,
                        ImageUrl = tmdbContent.ImageUrl,
                        Type = "movie"
                    };
                    _db.Contents.Add(newContent);
                    await _db.SaveChangesAsync();
                }
                catch { /* Hata yönetimi */ }
            }
        }
        // ---------------------------------------------------------

        var review = new Review
        {
            UserId = userId,
            ContentId = req.ContentId,
            Type = req.Type,
            Text = req.Text,
            CreatedAt = DateTime.UtcNow
        };

        // Aktivite Logu
        _db.Activities.Add(new Activity
        {
            UserId = userId,
            ActionType = "review",
            ContentId = req.ContentId,
            Type = req.Type,
            Snippet = req.Text.Length > 50 ? req.Text.Substring(0, 50) + "..." : req.Text
        });

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(review);
    }

    // Yorum sil (sadece sahibi)
    [HttpDelete("{id}")]
    [Authorize]
    public IActionResult Delete(int id)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var review = _db.Reviews.FirstOrDefault(r => r.Id == id && r.UserId == userId);
        if (review == null)
            return NotFound("Yorum bulunamadı veya silme yetkiniz yok.");

        _db.Reviews.Remove(review);
        _db.SaveChanges();

        return Ok("Silindi");
    }
}