using System.Net;
using System.Net.Mail;

namespace SocialLibrary.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var emailSettings = _config.GetSection("EmailSettings");
        var mail = emailSettings["Mail"];
        var pw = emailSettings["Password"];
        var host = emailSettings["Host"];
        var port = int.Parse(emailSettings["Port"]!);

        var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(mail, pw)
        };

        var mailMessage = new MailMessage(from: mail!, to: toEmail, subject, body)
        {
            IsBodyHtml = true // HTML formatında göndermek için
        };

        await client.SendMailAsync(mailMessage);
    }
}