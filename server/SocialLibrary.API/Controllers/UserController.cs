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

    // 1. PROFİL GETİRME
    [HttpGet("profile/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProfile(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound("Kullanıcı bulunamadı.");

        var followersCount = await _db.Follows.CountAsync(f => f.FollowingId == userId);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == userId);

        var currentUserIdStr =
            User.FindFirst("id")?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        bool isSelf = false;
        bool isFollowing = false;

        if (currentUserIdStr != null)
        {
            int currentId = int.Parse(currentUserIdStr);
            isSelf = currentId == userId;

            if (!isSelf)
            {
                isFollowing = await _db.Follows.AnyAsync(f =>
                    f.FollowerId == currentId &&
                    f.FollowingId == userId
                );
            }
        }

        var activities = await _db.Activities
            .Where(a => a.UserId == userId)
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .Select(a => new
            {
                a.Id,
                a.ActionType,
                a.CreatedAt,
                Content = new
                {
                    Id = a.ContentId,
                    Type = a.Type,
                    Title = a.Title,
                    ImageUrl = a.ImageUrl
                },
                User = new { a.User.Id, a.User.Username },
                a.Score,
                a.Status,
                a.Snippet
            })
            .ToListAsync();

        return Ok(new
        {
            User = new { user.Id, user.Username, user.Bio, user.AvatarUrl },
            Stats = new { followersCount, followingCount },
            IsSelf = isSelf,
            IsFollowing = isFollowing,
            Activities = activities
        });
    }

    // 2. KÜTÜPHANE GETİRME
    [HttpGet("library/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLibrary(int userId)
    {
        var allItems = await _db.UserContents
            .Where(uc => uc.UserId == userId)
            .OrderByDescending(uc => uc.SavedAt)
            .ToListAsync();

        return Ok(new
        {
            watched = allItems.Where(x => x.Status == "watched"),
            toWatch = allItems.Where(x => x.Status == "toWatch"),
            read = allItems.Where(x => x.Status == "read"),
            toRead = allItems.Where(x => x.Status == "toRead")
        });
    }

    // 3. PROFİL GÜNCELLEME
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId =
            int.Parse(User.FindFirst("id")?.Value ??
                      User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;

        await _db.SaveChangesAsync();
        return Ok(user);
    }
}

public class UpdateProfileDto
{
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}
