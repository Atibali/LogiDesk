using LogiDesk.Application.DTOs;
using LogiDesk.Application.Exceptions;
using LogiDesk.Application.Services;
using LogiDesk.Domain.Entities;
using LogiDesk.Domain.Enums;
using LogiDesk.Infrastructure.Data;
using LogiDesk.Infrastructure.Repositories;
using LogiDesk.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LogiDesk.Tests;

public class AuthTests
{
    private static (AuthService authService, AppDbContext dbContext) CreateTestSetup(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var dbContext = new AppDbContext(options);
        var userRepository = new UserRepository(dbContext);
        var passwordHasher = new PasswordHasher();

        var configValues = new Dictionary<string, string?>
        {
            {"Jwt:Key", "LogiDesk_Super_Secure_Secret_Key_For_Development_Environment_2026_Minimum_32_Bytes!"},
            {"Jwt:Issuer", "LogiDesk"},
            {"Jwt:Audience", "LogiDeskApp"},
            {"Jwt:ExpiresInHours", "24"}
        };
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();
        var jwtGenerator = new JwtTokenGenerator(configuration);

        var authService = new AuthService(userRepository, passwordHasher, jwtGenerator);
        return (authService, dbContext);
    }

    [Fact]
    public async Task Register_WithValidDetails_ShouldCreateCustomerAccount()
    {
        // Arrange
        var (authService, dbContext) = CreateTestSetup(nameof(Register_WithValidDetails_ShouldCreateCustomerAccount));
        var request = new RegisterRequest
        {
            Name = "John Customer",
            Email = "john.customer@example.com",
            Password = "SecurePassword123!"
        };

        // Act
        var response = await authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.NotEmpty(response.Token);
        Assert.Equal("john.customer@example.com", response.User.Email);
        Assert.Equal("Customer", response.User.Role);
        Assert.True(response.User.IsActive);

        var userInDb = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "john.customer@example.com");
        Assert.NotNull(userInDb);
        Assert.NotEqual("SecurePassword123!", userInDb.PasswordHash);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ShouldThrowValidationException()
    {
        // Arrange
        var (authService, _) = CreateTestSetup(nameof(Register_WithDuplicateEmail_ShouldThrowValidationException));
        var request = new RegisterRequest
        {
            Name = "First User",
            Email = "duplicate@example.com",
            Password = "Password123!"
        };
        await authService.RegisterAsync(request);

        var duplicateRequest = new RegisterRequest
        {
            Name = "Second User",
            Email = "duplicate@example.com",
            Password = "Password456!"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ValidationException>(() => authService.RegisterAsync(duplicateRequest));
        Assert.Contains("already exists", ex.Message);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnAuthResponse()
    {
        // Arrange
        var (authService, _) = CreateTestSetup(nameof(Login_WithValidCredentials_ShouldReturnAuthResponse));
        var registerRequest = new RegisterRequest
        {
            Name = "Login User",
            Email = "login.test@example.com",
            Password = "Password123!"
        };
        await authService.RegisterAsync(registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "login.test@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await authService.LoginAsync(loginRequest);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal("login.test@example.com", result.User.Email);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ShouldThrowAuthenticationException()
    {
        // Arrange
        var (authService, _) = CreateTestSetup(nameof(Login_WithWrongPassword_ShouldThrowAuthenticationException));
        var registerRequest = new RegisterRequest
        {
            Name = "Wrong Password User",
            Email = "wrongpass@example.com",
            Password = "CorrectPassword123!"
        };
        await authService.RegisterAsync(registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "wrongpass@example.com",
            Password = "WrongPassword999!"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<AuthenticationException>(() => authService.LoginAsync(loginRequest));
        Assert.Equal("Invalid email or password.", ex.Message);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ShouldThrowAuthenticationException()
    {
        // Arrange
        var (authService, _) = CreateTestSetup(nameof(Login_WithNonExistentEmail_ShouldThrowAuthenticationException));
        var loginRequest = new LoginRequest
        {
            Email = "doesnotexist@example.com",
            Password = "Password123!"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<AuthenticationException>(() => authService.LoginAsync(loginRequest));
        Assert.Equal("Invalid email or password.", ex.Message);
    }

    [Fact]
    public async Task Login_WithDeactivatedUser_ShouldThrowAuthenticationException()
    {
        // Arrange
        var (authService, dbContext) = CreateTestSetup(nameof(Login_WithDeactivatedUser_ShouldThrowAuthenticationException));
        var hasher = new PasswordHasher();
        var user = new User
        {
            Name = "Deactivated User",
            Email = "inactive@example.com",
            PasswordHash = hasher.HashPassword("Password123!"),
            Role = UserRole.Customer,
            IsActive = false
        };
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequest
        {
            Email = "inactive@example.com",
            Password = "Password123!"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<AuthenticationException>(() => authService.LoginAsync(loginRequest));
        Assert.Contains("deactivated", ex.Message);
    }
}
