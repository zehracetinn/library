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

    [HttpGet("search")]
    public async Task<IActionResult> Search(string query, string type = "movie")
    {
        if (type == "movie")
            return Ok(await _tmdb.SearchContentAsync(query));

        if (type == "book")
            return Ok(await _books.SearchContentAsync(query));

        return BadRequest("type must be 'movie' or 'book'");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContent(string id, string type = "movie")
    {
        if (type == "movie")
            return Ok(await _tmdb.GetContentDetailsAsync((id)));

        if (type == "book")
            return Ok(await _books.GetContentDetailsAsync(id));

        return BadRequest("type must be 'movie' or 'book'");
    }
}
