namespace SocialLibrary.API.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Overview { get; set; }
        public string? PosterPath { get; set; }  // Film poster URL'si
        public double AverageRating { get; set; }
        public string? ReleaseDate { get; set; }
        public string? Genre { get; set; }
    }
}
