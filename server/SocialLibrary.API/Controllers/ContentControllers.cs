using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Services;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentController : ControllerBase
{
    private readonly TmdbService _tmdb;
    private readonly GoogleBooksService _books;

    public ContentController(TmdbService tmdb, GoogleBooksService books)
    {
        _tmdb = tmdb;
        _books = books;
    }

    // 🔍 Film + Kitap Arama
    [HttpGet("search")]
    public async Task<IActionResult> Search(string query, string type = "movie")
    {
        if (type == "movie")
        {
            var movies = await _tmdb.SearchContentListAsync(query);
            return Ok(new { items = movies });
        }

        if (type == "book")
        {
            var books = await _books.SearchContentListAsync(query);
            return Ok(new { items = books });
        }

        return BadRequest("type must be 'movie' or 'book'");
    }

    // 🔍 Detay
    [HttpGet("{id}")]
    public async Task<IActionResult> GetContent(string id, string type = "movie")
    {
        if (type == "movie")
            return Ok(await _tmdb.GetContentDetailsAsync(id));

        if (type == "book")
            return Ok(await _books.GetContentDetailsAsync(id));

        return BadRequest("type must be 'movie' or 'book'");
    }
}
