namespace SocialLibrary.API.Models;

public class DiscoverResult
{
    public string ContentId { get; set; } = "";
    public string Type { get; set; } = "";
    public double AverageScore { get; set; }
    public int VoteCount { get; set; }
}
