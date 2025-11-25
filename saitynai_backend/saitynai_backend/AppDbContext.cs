using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using saitynai_backend.Entities;

namespace saitynai_backend
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Mentor> Mentors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Faculty>()
                .Property(f => f.Id)
                .ValueGeneratedOnAdd();

            // User ↔ Community (1:n)
            modelBuilder.Entity<Mentor>()
                .HasOne(c => c.Faculty)
                .WithMany(u => u.Mentors);

            // User ↔ Post (1:n)
            modelBuilder.Entity<Group>()
                .HasOne(p => p.Mentor)
                .WithMany(u => u.Groups);
        }
    }
}
