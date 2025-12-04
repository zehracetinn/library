using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers
{
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

        // TAKİP ET
        [HttpPost("{targetUserId}")]
        public async Task<IActionResult> FollowUser(int targetUserId)
        {
            var userId = int.Parse(User.FindFirst("id")!.Value);

            if (userId == targetUserId)
                return BadRequest("Kendini takip edemezsin.");

            bool already = await _db.Follows
                .AnyAsync(f => f.FollowerId == userId && f.FollowingId == targetUserId);

            if (already)
                return BadRequest("Zaten takip ediyorsun.");

            var follow = new Follow
            {
                FollowerId = userId,
                FollowingId = targetUserId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Follows.Add(follow);
            await _db.SaveChangesAsync();

            // Kullanıcı bilgilerini döndürebiliriz
            var user = await _db.Users
                .Where(u => u.Id == targetUserId)
                .Select(u => new { u.Id, u.Username, u.AvatarUrl, u.FollowersCount, u.FollowingCount })
                .FirstOrDefaultAsync();

            return Ok(new 
            { 
                message = "Takip edildi.",
                user
            });
        }

        // TAKİPTEN ÇIK
        [HttpDelete("{targetUserId}")]
        public async Task<IActionResult> UnfollowUser(int targetUserId)
        {
            var userId = int.Parse(User.FindFirst("id")!.Value);

            var follow = await _db.Follows
                .FirstOrDefaultAsync(f =>
                    f.FollowerId == userId &&
                    f.FollowingId == targetUserId);

            if (follow == null)
                return BadRequest("Bu kullanıcıyı zaten takip etmiyorsun.");

            _db.Follows.Remove(follow);
            await _db.SaveChangesAsync();

            // Takipçi ve takip edilen sayısını güncelle
            var followerCountUpdate = await _db.Follows
                .CountAsync(f => f.FollowingId == targetUserId);
            var followingCountUpdate = await _db.Follows
                .CountAsync(f => f.FollowerId == targetUserId);

            var user = await _db.Users
                .Where(u => u.Id == targetUserId)
                .FirstOrDefaultAsync();

            if (user != null)
            {
                user.FollowersCount = followerCountUpdate;
                user.FollowingCount = followingCountUpdate;
                await _db.SaveChangesAsync();
            }

            // Kullanıcı bilgilerini döndürebiliriz
            var userInfo = await _db.Users
                .Where(u => u.Id == targetUserId)
                .Select(u => new { u.Id, u.Username, u.AvatarUrl, u.FollowersCount, u.FollowingCount })
                .FirstOrDefaultAsync();

            return Ok(new 
            { 
                message = "Takipten çıkıldı.",
                user = userInfo
            });
        }
    }
}
