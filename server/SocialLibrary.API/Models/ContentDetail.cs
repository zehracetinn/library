namespace SocialLibrary.API.Models
{
    public class ContentDetail : Content
    {
        public string? Director { get; set; }
        public string? Authors { get; set; }
        public string? Genre { get; set; }
        public double Rating { get; set; }
    }
}
