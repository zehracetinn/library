using Microsoft.AspNetCore.Mvc;
using SocialLibrary.API.Services;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentController : ControllerBase
{
    private readonly IContentService _contentService;

    public ContentController(IContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string type = "movie")
    {
        var content = await _contentService.SearchContentAsync(query, type);
        return Ok(content);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContent(int id, [FromQuery] string type = "movie")
    {
        var contentDetail = await _contentService.GetContentDetailsAsync(id, type);
        return Ok(contentDetail);
    }
}
