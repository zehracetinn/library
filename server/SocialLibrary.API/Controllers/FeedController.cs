using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedController(AppDbContext db)
    {
        _db = db;
    }

    // /api/Feed?page=1&pageSize=20
    [HttpGet]
    public IActionResult GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var followingIds = _db.Follows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowedId)
            .ToList();

        // Kendi aktivitelerini de görmek istersen:
        followingIds.Add(userId);

        var query = _db.Activities
            .Where(a => followingIds.Contains(a.UserId))
            .OrderByDescending(a => a.CreatedAt);

        var total = query.Count();

        var items = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new
        {
            total,
            page,
            pageSize,
            items
        });
    }
}
