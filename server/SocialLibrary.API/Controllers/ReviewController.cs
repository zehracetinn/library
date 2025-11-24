using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    // İçeriğe ait yorumları listele (anonim erişilebilir olsun)
    [HttpGet("content/{contentId}")]
    [AllowAnonymous]
    public IActionResult GetForContent(string contentId, [FromQuery] string type)
    {
        var reviews = _db.Reviews
            .Where(r => r.ContentId == contentId && r.Type == type)
            .OrderByDescending(r => r.CreatedAt)
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
    public IActionResult Add([FromBody] AddReviewRequest req)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var review = new Review
        {
            UserId = userId,
            ContentId = req.ContentId,
            Type = req.Type,
            Text = req.Text
        };

        _db.Reviews.Add(review);
        _db.SaveChanges();

        return Ok(review);
    }

    // Yorum güncelle (sadece sahibi)
    [HttpPut("{id}")]
    [Authorize]
    public IActionResult Update(int id, [FromBody] string newText)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var review = _db.Reviews.FirstOrDefault(r => r.Id == id && r.UserId == userId);
        if (review == null)
            return NotFound();

        review.Text = newText;
        review.UpdatedAt = DateTime.UtcNow;

        _db.SaveChanges();
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
            return NotFound();

        _db.Reviews.Remove(review);
        _db.SaveChanges();

        return Ok("Deleted");
    }
}
