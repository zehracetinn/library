namespace SocialLibrary.API.Models
{
    public class TmdbSearchResult
    {
        public List<Movie> Results { get; set; } = new List<Movie>();  // Movie listesi, nullable olarak işaretledik
    }
}
