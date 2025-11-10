namespace SocialLibrary.API.Services;

public interface IContentService
{
    Task<Content> SearchContentAsync(string query, string type = "movie");
    Task<ContentDetail> GetContentDetailsAsync(int contentId, string type = "movie");
}

public class Content
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? Year { get; set; }
    public string? ImageUrl { get; set; }
}

public class ContentDetail : Content
{
    public string? Director { get; set; }
    public string? Authors { get; set; }
    public string? Genre { get; set; }
    public int Rating { get; set; }
}
