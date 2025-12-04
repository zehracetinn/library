using System.Threading.Tasks;

namespace SocialLibrary.API.Services;

public class EmailService : IEmailService
{
    public Task SendAsync(string to, string subject, string body)
    {
        // Şimdilik sadece konsola yaz
        Console.WriteLine($"[EMAIL] To: {to}, Subject: {subject}, Body: {body}");
        return Task.CompletedTask;
    }
}
