using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Models;

// 👇 BURASI ÇOK ÖNEMLİ: Klasör yapına göre doğrusu bu.
namespace SocialLibrary.API.Data; 

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // --- ACTIVITY LIKE ---
    public DbSet<ActivityLike> ActivityLikes { get; set; }

    // --- USERS ---
    public DbSet<User> Users => Set<User>();

    // --- CORE ENTITIES ---
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Content> Contents { get; set; }

    // --- SOCIAL ---
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Follow> Follows { get; set; }

    // --- LIBRARY ---
    public DbSet<UserContent> UserContents { get; set; }

    // --- CUSTOM LISTS ---
    public DbSet<CustomList> CustomLists { get; set; }
    public DbSet<CustomListItem> CustomListItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // İlişki ayarları... (Burası aynı kalabilir, değiştirmene gerek yok)
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        
        modelBuilder.Entity<Activity>().HasOne(a => a.User).WithMany(u => u.Activities).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ActivityLike>().HasOne(l => l.Activity).WithMany(a => a.Likes).HasForeignKey(l => l.ActivityId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Follow>().HasOne(f => f.Follower).WithMany().HasForeignKey(f => f.FollowerId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Follow>().HasOne(f => f.Following).WithMany().HasForeignKey(f => f.FollowingId).OnDelete(DeleteBehavior.Restrict);
    }
}