using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;
using SocialLibrary.API.Services; // TmdbService için gerekli
using Microsoft.EntityFrameworkCore;


namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RatingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TmdbService _tmdbService;

    // TmdbService'i buraya ekledik (Dependency Injection)
    public RatingsController(AppDbContext db, TmdbService tmdbService)
    {
        _db = db;
        _tmdbService = tmdbService;
    }

    public class RateRequest
    {
        public string ContentId { get; set; } = "";
        public string Type { get; set; } = "";      // movie / book
        public int Score { get; set; }
        public string? Title { get; set; }
        public string? ImageUrl { get; set; }
    }

    // POST /api/Ratings
    [HttpPost]
    public async Task<IActionResult> Rate([FromBody] RateRequest req)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        if (req.Score < 1 || req.Score > 10)
            return BadRequest("Puan 1 ile 10 arasında olmalıdır.");

        // ---------------------------------------------------------
        // 1. ADIM: İÇERİK KONTROLÜ (HAYALET FİLM SORUNU ÇÖZÜMÜ)
        // ---------------------------------------------------------
        var contentExists = _db.Contents.Any(c => c.Id == req.ContentId);
        
        if (!contentExists)
        {
            // Veritabanında yoksa, önce TMDB'den çekip kaydedelim
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
                        Year = "", // Servisten yıl dönüyorsa eklenebilir
                        Type = "movie"
                    };
                    _db.Contents.Add(newContent);
                    await _db.SaveChangesAsync(); // Önce içeriği kaydet!
                }
                catch
                {
                    // Eğer TMDB'de de bulunamazsa (çok nadir), hata dönmeyelim
                    // Sadece loglayıp devam edebiliriz veya manuel ekleyebiliriz.
                }
            }
            // Kitap için ilerde buraya else if (req.Type == "book") eklersin.
        }
        // ---------------------------------------------------------

        // 2. ADIM: PUANLAMA İŞLEMİ
        var existing = _db.Ratings
            .FirstOrDefault(r => r.UserId == userId &&
                                 r.ContentId == req.ContentId &&
                                 r.Type == req.Type);

        if (existing == null)
        {
            var rating = new Rating
            {
                UserId = userId,
                ContentId = req.ContentId,
                Type = req.Type,
                Score = req.Score
            };
            _db.Ratings.Add(rating);
        }
        else
        {
            existing.Score = req.Score;
            existing.RatedAt = DateTime.UtcNow;
        }

        // 3. ADIM: AKTİVİTE LOGU
        _db.Activities.Add(new Activity
        {
            UserId = userId,
            ActionType = "rating",
            ContentId = req.ContentId,
            Type = req.Type,
            Score = req.Score,
            Title = req.Title,
            ImageUrl = req.ImageUrl
        });

        await _db.SaveChangesAsync();
        return Ok();
    }


        [HttpGet("user/{contentId}")]
    public async Task<IActionResult> GetUserRating(string contentId, [FromQuery] string type)
    {
        var userId = int.Parse(User.FindFirst("id")!.Value);

        var rating = await _db.Ratings
            .FirstOrDefaultAsync(x => x.UserId == userId &&
                                    x.ContentId == contentId &&
                                    x.Type == type);

        if (rating == null)
            return Ok(new { score = 0 });

        return Ok(new { score = rating.Score });
    }


    // GET /api/Ratings/content/{contentId}?type=movie
    [HttpGet("content/{contentId}")]
    [AllowAnonymous]
    public IActionResult GetContentRating(string contentId, [FromQuery] string type)
    {
        var ratings = _db.Ratings
            .Where(r => r.ContentId == contentId && r.Type == type)
            .ToList();

        if (!ratings.Any())
            return Ok(new { average = 0, count = 0 });

        var avg = ratings.Average(r => r.Score);
        var count = ratings.Count;

        return Ok(new { average = avg, count });
    }
}