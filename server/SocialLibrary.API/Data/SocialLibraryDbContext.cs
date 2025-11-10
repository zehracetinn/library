using Microsoft.EntityFrameworkCore;
using SocialLibrary.API.Models;

namespace SocialLibrary.API.Data
{
    public class SocialLibraryDbContext : DbContext
    {
        public SocialLibraryDbContext(DbContextOptions<SocialLibraryDbContext> options)
            : base(options)
        {
        }

        // Tablolar
        public DbSet<User> Users { get; set; }
    }
}
