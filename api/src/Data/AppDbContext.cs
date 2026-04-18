using Microsoft.EntityFrameworkCore;
using EventPredictionAPI.Models;

namespace EventPredictionAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Registration> Registrations => Set<Registration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ──────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Role).HasDefaultValue("User");
        });

        // ── Events ─────────────────────────────────────────────────
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TicketPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Mode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
        });

        // ── Registrations ──────────────────────────────────────────
        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasKey(r => r.Id);

            // Unique: a user can only have one active registration per event
            entity.HasIndex(r => new { r.UserId, r.EventId }).IsUnique();

            entity.HasOne(r => r.User)
                  .WithMany(u => u.Registrations)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Event)
                  .WithMany(e => e.Registrations)
                  .HasForeignKey(r => r.EventId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
