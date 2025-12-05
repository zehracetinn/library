using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Services;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly TmdbService _tmdbService;
    private readonly GoogleBooksService _googleBooksService;

    public DiscoverController(TmdbService tmdbService, GoogleBooksService googleBooksService)
    {
        _tmdbService = tmdbService;
        _googleBooksService = googleBooksService;
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

    // GET: /api/Discover/search
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? query, 
        // HATA BURADAYDI: Varsayılan değeri olan parametreler en sonda olmalı veya diğerleri de varsayılan almalı.
        // ÇÖZÜM: Hepsine = null veriyoruz.
        [FromQuery] string type = "movie", 
        [FromQuery] string? genre = null, 
        [FromQuery] int? year = null, 
        [FromQuery] double? rating = null)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new { items = new List<object>() });
        }

        if (type == "book")
        {
            var bookResults = await _googleBooksService.SearchContentListAsync(query);
            return Ok(new { items = bookResults });
        }
        else
        {
            var movieResults = await _tmdbService.SearchMoviesAsync(query, genre, year, rating);
            return Ok(new { items = movieResults });
        }
    }
}