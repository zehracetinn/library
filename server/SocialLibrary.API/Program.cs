using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SocialLibrary.API.Data;
using SocialLibrary.API.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONTROLLERS ---
builder.Services.AddControllers();

// --- 2. CORS (React Bağlantısı) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// --- 3. DATABASE (PostgreSQL) ---
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// --- 4. SWAGGER (API Dokümantasyonu) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "JWT token'ı buraya yazın. Format: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// --- 5. HTTP CLIENTS (Burada Servisleri Kaydediyoruz) ---
builder.Services.AddHttpClient<TmdbService>(c =>
{
    c.BaseAddress = new Uri("https://api.themoviedb.org/3/");
});

builder.Services.AddHttpClient<GoogleBooksService>(c =>
{
    c.BaseAddress = new Uri("https://www.googleapis.com/books/v1/");
});

builder.Services.AddScoped<IEmailService, EmailService>();

// --- 6. DİĞER SERVİSLER ---
// NOT: TmdbService ve GoogleBooksService'i yukarıda eklediğimiz için burada tekrar AddScoped yapmıyoruz!
builder.Services.AddScoped<ITokenService, TokenService>();
// builder.Services.AddScoped<IUserService, UserService>(); // Eğer UserService'in varsa bunu açabilirsin
// builder.Services.AddScoped<IEmailService, EmailService>(); // Varsa aç

// --- 7. JWT AUTHENTICATION ---
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_key_123456789_must_be_long"; // Hata almamak için varsayılan
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.RequireHttpsMetadata = false;
        opt.SaveToken = true;
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// --- 8. MIDDLEWARE (Uygulama Çalışma Sırası) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();