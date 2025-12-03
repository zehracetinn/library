using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;
using SocialLibrary.API.Services;
using Microsoft.EntityFrameworkCore;


namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserContentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TmdbService _tmdbService;

    public UserContentController(AppDbContext db, TmdbService tmdbService)
    {
        _db = db;
        _tmdbService = tmdbService;
    }

    public class SetStatusRequest
    {
        public string ContentId { get; set; } = "";
        public string Type { get; set; } = "";      // movie/book
        public string Title { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "";    // watched/toWatch/read/toRead
    }

    // KÜTÜPHANE STATÜSÜ EKLE / GÜNCELLE
    [HttpPost("set-status")]
    public async Task<IActionResult> SetStatus([FromBody] SetStatusRequest req)
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

        var item = _db.UserContents
            .FirstOrDefault(x => x.UserId == userId &&
                                 x.ContentId == req.ContentId &&
                                 x.Type == req.Type);

        if (item == null)
        {
            item = new UserContent
            {
                UserId = userId,
                ContentId = req.ContentId,
                Title = req.Title,
                ImageUrl = req.ImageUrl,
                Type = req.Type,
                Status = req.Status,
                SavedAt = DateTime.UtcNow
            };
            _db.UserContents.Add(item);
        }
        else
        {
            item.Status = req.Status;
            item.SavedAt = DateTime.UtcNow; // Güncelleme tarihini yenile
        }

        // Aktivite Logu
        _db.Activities.Add(new Activity
        {
            UserId = userId,
            ActionType = "status",
            ContentId = req.ContentId,
            Type = req.Type,
            Status = req.Status,
            Title = req.Title,
            ImageUrl = req.ImageUrl
        });

        await _db.SaveChangesAsync();
        return Ok(item);
    }
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus([FromQuery] string contentId, [FromQuery] string type)
    {
        var userId = int.Parse(User.FindFirst("id")!.Value);

        var record = await _db.UserContents
            .FirstOrDefaultAsync(x => x.UserId == userId && 
                                    x.ContentId == contentId &&
                                    x.Type == type);

        if (record == null)
            return Ok(new { status = "none" });

        return Ok(new { status = record.Status });
    }

    // FAVORİLERİ LİSTELEME
    [HttpGet("list")]
    public IActionResult GetList()
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var items = _db.UserContents
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToList();

        return Ok(items);
    }
}