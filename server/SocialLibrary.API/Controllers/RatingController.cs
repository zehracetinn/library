using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RatingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RatingsController(AppDbContext db)
    {
        _db = db;
    }

    public class RateRequest
    {
        public string ContentId { get; set; } = "";
        public string Type { get; set; } = "";   // "movie" / "book"
        public int Score { get; set; }           // 1–10
    }

    // 1) Puan ver / güncelle
    [HttpPost]
    public IActionResult Rate([FromBody] RateRequest req)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        if (req.Score < 1 || req.Score > 10)
            return BadRequest("Score must be between 1 and 10");

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

        _db.SaveChanges();
        return Ok();
    }

    // 2) İçeriğin ortalama puanı + oy sayısı
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
