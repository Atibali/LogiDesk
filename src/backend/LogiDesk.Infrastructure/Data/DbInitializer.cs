using LogiDesk.Domain.Entities;
using LogiDesk.Domain.Enums;
using LogiDesk.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LogiDesk.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, IPasswordHasher passwordHasher, ILogger logger)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // DB has already been seeded
        }

        logger.LogInformation("Seeding initial LogiDesk users...");

        var users = new List<User>
        {
            new()
            {
                Name = "System Administrator",
                Email = "admin@logidesk.com",
                PasswordHash = passwordHasher.HashPassword("Admin@123"),
                Role = UserRole.Administrator,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Operations Manager",
                Email = "manager@logidesk.com",
                PasswordHash = passwordHasher.HashPassword("Manager@123"),
                Role = UserRole.OperationsManager,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Support Agent",
                Email = "agent@logidesk.com",
                PasswordHash = passwordHasher.HashPassword("Agent@123"),
                Role = UserRole.SupportAgent,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Alice Customer",
                Email = "customer@logidesk.com",
                PasswordHash = passwordHasher.HashPassword("Customer@123"),
                Role = UserRole.Customer,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        logger.LogInformation("Initial LogiDesk demo users successfully seeded.");
    }
}
