using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // JWT gerekli
public class UserContentController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserContentController(AppDbContext db)
    {
        _db = db;
    }

    // -------------------------------
    // FAVORİYE EKLEME
    // -------------------------------
    [HttpPost("add")]
    public IActionResult Add(UserContent model)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        model.UserId = userId;
        _db.UserContents.Add(model);
        _db.SaveChanges();

        return Ok(model);
    }

    // -------------------------------
    // FAVORİLERİ LİSTELEME
    // -------------------------------
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

    // -------------------------------
    // FAVORİ SİLME
    // -------------------------------
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var item = _db.UserContents
            .FirstOrDefault(x => x.Id == id && x.UserId == userId);

        if (item == null)
            return NotFound();

        _db.UserContents.Remove(item);
        _db.SaveChanges();

        return Ok("Deleted");
    }

    // ------------------------------------------------
    // KÜTÜPHANE STATÜSÜ EKLE / GÜNCELLE (watched / toWatch / read / toRead)
    // ------------------------------------------------
    [HttpPost("set-status")]
    public IActionResult SetStatus([FromBody] SetStatusRequest req)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

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
                Status = req.Status
            };
            _db.UserContents.Add(item);
        }
        else
        {
            item.Status = req.Status;
        }
        _db.Activities.Add(new Activity
        {
            UserId = userId,
            sActionType = "status",
            ContentId = req.ContentId,
            Type = req.Type,
            Status = req.Status,
            Title = req.Title,
            ImageUrl = req.ImageUrl
        });

        _db.SaveChanges();
        return Ok(item);
    }

    public class SetStatusRequest
    {
        public string ContentId { get; set; } = "";
        public string Type { get; set; } = "";      // movie/book
        public string Title { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "";    // watched/toWatch/read/toRead
    }

    // ------------------------------------------------
    // BELİRLİ STATÜYE GÖRE FİLTRELEME
    // ------------------------------------------------
    [HttpGet("by-status")]
    public IActionResult GetByStatus([FromQuery] string status)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var items = _db.UserContents
            .Where(x => x.UserId == userId && x.Status == status)
            .OrderByDescending(x => x.SavedAt)
            .ToList();

        return Ok(items);
    }
}
