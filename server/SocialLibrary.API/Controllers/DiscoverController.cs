using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Services;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly TmdbService _tmdbService;

    public DiscoverController(TmdbService tmdbService)
    {
        _tmdbService = tmdbService;
    }

    // GET: /api/Discover/top-rated
    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated([FromQuery] string type = "movie")
    {
        if (type == "movie")
        {
            var results = await _tmdbService.GetTopRatedAsync();
            return Ok(new { items = results });
        }
        return Ok(new { items = new List<object>() });
    }

    // GET: /api/Discover/most-popular
    [HttpGet("most-popular")]
    public async Task<IActionResult> GetMostPopular([FromQuery] string type = "movie")
    {
        if (type == "movie")
        {
            var results = await _tmdbService.GetPopularAsync();
            return Ok(new { items = results });
        }
        return Ok(new { items = new List<object>() });
    }

    // --- YENİ EKLENEN FİLTRELEME KAPISI ---
    // Bu metod olmadan Frontend filtre gönderse bile Backend cevap veremez.
    // Örnek İstek: /api/Discover/search?query=Batman&year=2008&rating=8
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? query, [FromQuery] string? genre, [FromQuery] int? year, [FromQuery] double? rating)
    {
        // TmdbService içindeki gelişmiş arama metodunu çağırıyoruz
        var results = await _tmdbService.SearchMoviesAsync(query ?? "", genre, year, rating);
        return Ok(new { items = results });
    }
}