using LogiDesk.Application.Services;
using LogiDesk.Domain.Entities;
using LogiDesk.Domain.Enums;
using LogiDesk.Infrastructure.Data;
using LogiDesk.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LogiDesk.Tests;

public class UserManagementTests
{
    private static (UserService userService, AppDbContext dbContext) CreateTestSetup(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var dbContext = new AppDbContext(options);
        var userRepository = new UserRepository(dbContext);
        var userService = new UserService(userRepository);
        return (userService, dbContext);
    }

    [Fact]
    public async Task GetAllUsers_ShouldReturnAllRegisteredUsers()
    {
        // Arrange
        var (userService, dbContext) = CreateTestSetup(nameof(GetAllUsers_ShouldReturnAllRegisteredUsers));
        await dbContext.Users.AddRangeAsync(
            new User { Name = "User 1", Email = "u1@test.com", Role = UserRole.Customer },
            new User { Name = "User 2", Email = "u2@test.com", Role = UserRole.SupportAgent }
        );
        await dbContext.SaveChangesAsync();

        // Act
        var users = await userService.GetAllUsersAsync();

        // Assert
        Assert.Equal(2, users.Count);
    }

    [Fact]
    public async Task UpdateUserStatus_ShouldToggleActiveFlag()
    {
        // Arrange
        var (userService, dbContext) = CreateTestSetup(nameof(UpdateUserStatus_ShouldToggleActiveFlag));
        var user = new User { Name = "Toggle User", Email = "toggle@test.com", IsActive = true };
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        // Act
        var updated = await userService.UpdateUserStatusAsync(user.UserId, false);

        // Assert
        Assert.False(updated.IsActive);
        var inDb = await dbContext.Users.FindAsync(user.UserId);
        Assert.False(inDb!.IsActive);
    }

    [Fact]
    public async Task UpdateUserRole_ShouldChangeUserRole()
    {
        // Arrange
        var (userService, dbContext) = CreateTestSetup(nameof(UpdateUserRole_ShouldChangeUserRole));
        var user = new User { Name = "Role User", Email = "role@test.com", Role = UserRole.Customer };
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        // Act
        var updated = await userService.UpdateUserRoleAsync(user.UserId, "SupportAgent");

        // Assert
        Assert.Equal("SupportAgent", updated.Role);
        var inDb = await dbContext.Users.FindAsync(user.UserId);
        Assert.Equal(UserRole.SupportAgent, inDb!.Role);
    }
}
