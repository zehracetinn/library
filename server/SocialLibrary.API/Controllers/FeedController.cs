using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;

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

    // GET: api/feed?page=1&pageSize=20
    [HttpGet]
    [Authorize]  // Feed yalnızca giriş yapan kullanıcıya görünür
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        int userId = int.Parse(User.FindFirst("id")!.Value);

        // QUERY: Activity + User bilgisi
        var query = _db.Activities
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt);

        // SAYFALANDIRMA
        var totalCount = await query.CountAsync();

        var activities = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                // ----------------------------------------------------
                // 📌 Activity Temel Bilgileri
                // ----------------------------------------------------
                id = a.Id,
                actionType = a.ActionType,
                createdAt = a.CreatedAt,

                // ----------------------------------------------------
                // 📌 FE'nin beklediği USER objesi
                // ----------------------------------------------------
                user = new
                {
                    id = a.User.Id,
                    username = a.User.Username,
                    avatarUrl = a.User.AvatarUrl
                },

                // ----------------------------------------------------
                // 📌 FE'nin beklediği CONTENT objesi
                // ----------------------------------------------------
                content = new
                {
                    id = a.ContentId,
                    type = a.Type,
                    title = a.Title,
                    imageUrl = a.ImageUrl
                },

                // ----------------------------------------------------
                // 📌 Aktiviteye ait diğer alanlar
                // ----------------------------------------------------
                score = a.Score,
                status = a.Status,
                snippet = a.Snippet,

                // ----------------------------------------------------
                // 📌 Beğeni Sayısı
                // ----------------------------------------------------
                likeCount = _db.ActivityLikes.Count(l => l.ActivityId == a.Id),

                // ----------------------------------------------------
                // 📌 Kullanıcı Beğenmiş mi?
                // ----------------------------------------------------
                likedByUser = _db.ActivityLikes.Any(l =>
                    l.ActivityId == a.Id && l.UserId == userId)
            })
            .ToListAsync();

        // ----------------------------------------------------
        // 📌 RESPONSE
        // ----------------------------------------------------
        return Ok(new
        {
            total = totalCount,
            page,
            pageSize,
            items = activities
        });
    }
}
