using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<Review> Reviews { get; set; }


    public DbSet<UserContent> UserContents => Set<UserContent>();   // 🔥 BURADA OLMALI

    // 🔹 Bu kısım: email ve username alanlarının benzersiz olmasını sağlar
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}
