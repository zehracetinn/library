using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Services; // TmdbService için bunu ekledik
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly TmdbService _tmdbService;

    // TmdbService'i buraya "Inject" ettik. Artık kullanabiliriz.
    public DiscoverController(TmdbService tmdbService)
    {
        _tmdbService = tmdbService;
    }

    // GET: /api/Discover/top-rated
    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated([FromQuery] string type = "movie")
    {
        // Eğer film isteniyorsa TMDB'den çek
        if (type == "movie")
        {
            var results = await _tmdbService.GetTopRatedAsync();
            return Ok(new { items = results });
        }

        // Kitap kısmı için ilerde GoogleBooksService eklersin
        return Ok(new { items = new List<object>() });
    }

    // GET: /api/Discover/most-popular
    [HttpGet("most-popular")]
    public async Task<IActionResult> GetMostPopular([FromQuery] string type = "movie")
    {
        // Eğer film isteniyorsa TMDB'den çek
        if (type == "movie")
        {
            var results = await _tmdbService.GetPopularAsync();
            return Ok(new { items = results });
        }

        return Ok(new { items = new List<object>() });
    }
}