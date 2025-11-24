using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowController : ControllerBase
{
    private readonly AppDbContext _db;

    public FollowController(AppDbContext db)
    {
        _db = db;
    }

    // /api/Follow/{targetUserId}  → follow / unfollow toggle
    [HttpPost("{targetUserId}")]
    public IActionResult ToggleFollow(int targetUserId)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        if (userId == targetUserId)
            return BadRequest("Kendini takip edemezsin.");

        var existing = _db.Follows
            .FirstOrDefault(f => f.FollowerId == userId && f.FollowedId == targetUserId);

        if (existing == null)
        {
            var follow = new Follow
            {
                FollowerId = userId,
                FollowedId = targetUserId
            };
            _db.Follows.Add(follow);
            _db.SaveChanges();
            return Ok(new { followed = true });
        }
        else
        {
            _db.Follows.Remove(existing);
            _db.SaveChanges();
            return Ok(new { followed = false });
        }
    }

    // Takip ettiklerim
    [HttpGet("following")]
    public IActionResult GetFollowing()
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var list = _db.Follows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowedId)
            .ToList();

        return Ok(list);
    }

    // Beni takip edenler
    [HttpGet("followers")]
    public IActionResult GetFollowers()
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        var list = _db.Follows
            .Where(f => f.FollowedId == userId)
            .Select(f => f.FollowerId)
            .ToList();

        return Ok(list);
    }
}
