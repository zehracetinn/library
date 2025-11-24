using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly AppDbContext _db;

    public DiscoverController(AppDbContext db)
    {
        _db = db;
    }

    // /api/Discover/top-rated?type=movie&minVotes=5
    [HttpGet("top-rated")]
    public IActionResult GetTopRated([FromQuery] string type = "movie", [FromQuery] int minVotes = 5, [FromQuery] int limit = 20)
    {
        var query = _db.Ratings
            .Where(r => r.Type == type)
            .GroupBy(r => new { r.ContentId, r.Type })
            .Select(g => new DiscoverResult
            {
                ContentId = g.Key.ContentId,
                Type = g.Key.Type,
                AverageScore = g.Average(x => x.Score),
                VoteCount = g.Count()
            })
            .Where(x => x.VoteCount >= minVotes)
            .OrderByDescending(x => x.AverageScore)
            .ThenByDescending(x => x.VoteCount)
            .Take(limit)
            .ToList();

        return Ok(query);
    }

    // /api/Discover/most-popular?type=movie
    [HttpGet("most-popular")]
    public IActionResult GetMostPopular([FromQuery] string type = "movie", [FromQuery] int limit = 20)
    {
        var query = _db.UserContents
            .Where(c => c.Type == type)
            .GroupBy(c => new { c.ContentId, c.Type })
            .Select(g => new
            {
                ContentId = g.Key.ContentId,
                Type = g.Key.Type,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(limit)
            .ToList();

        return Ok(query);
    }
}
