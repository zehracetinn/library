namespace SocialLibrary.API.Models
{
    public class Content
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string? Year { get; set; }
        public string? ImageUrl { get; set; }

        public string Type { get; set; } = "movie"; // movie veya book

    }
}
