using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Data;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Sadece giriş yapmış kullanıcılar
public class CustomListController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomListController(AppDbContext db)
    {
        _db = db;
    }

    // 1. Kullanıcının Tüm Listelerini Getir (İçindeki filmlerle beraber)
    [HttpGet]
    public async Task<IActionResult> GetMyLists()
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var lists = await _db.CustomLists
            .Where(l => l.UserId == userId)
            .Include(l => l.Items) // Listeye ekli filmleri de getir
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(lists);
    }

    // 2. Yeni Liste Oluştur
    [HttpPost]
    public async Task<IActionResult> CreateList([FromBody] CreateListDto dto)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Liste adı boş olamaz.");

        var newList = new CustomList
        {
            UserId = userId,
            Name = dto.Name
        };

        _db.CustomLists.Add(newList);
        await _db.SaveChangesAsync();

        return Ok(newList);
    }

    // 3. Bir Listeye İçerik Ekle veya Çıkar (Toggle)
    [HttpPost("toggle-item")]
    public async Task<IActionResult> ToggleItem([FromBody] AddItemDto dto)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        // Liste bu kullanıcıya mı ait?
        var list = await _db.CustomLists.FirstOrDefaultAsync(l => l.Id == dto.ListId && l.UserId == userId);
        if (list == null) return NotFound("Liste bulunamadı.");

        // Bu içerik zaten listede var mı?
        var existingItem = await _db.CustomListItems
            .FirstOrDefaultAsync(i => i.CustomListId == dto.ListId && i.ContentId == dto.ContentId);

        if (existingItem != null)
        {
            // Varsa çıkar (Remove)
            _db.CustomListItems.Remove(existingItem);
            await _db.SaveChangesAsync();
            return Ok(new { action = "removed" });
        }
        else
        {
            // Yoksa ekle (Add)
            var newItem = new CustomListItem
            {
                CustomListId = dto.ListId,
                ContentId = dto.ContentId,
                Type = dto.Type,
                Title = dto.Title,
                ImageUrl = dto.ImageUrl
            };
            _db.CustomListItems.Add(newItem);
            
            // Aktivite Logu (Opsiyonel: Akışta göstermek istersen)
            /*
            _db.Activities.Add(new Activity {
                UserId = userId,
                ActionType = "add_list",
                ContentId = dto.ContentId,
                Snippet = list.Name // Hangi listeye eklediğini sakla
            });
            */
            
            await _db.SaveChangesAsync();
            return Ok(new { action = "added" });
        }
    }
}

// DTO Sınıfları (Veri transferi için)
public class CreateListDto { public string Name { get; set; } }
public class AddItemDto 
{ 
    public int ListId { get; set; }
    public string ContentId { get; set; }
    public string Type { get; set; }
    public string Title { get; set; }
    public string? ImageUrl { get; set; }
}