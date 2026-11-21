using LogiDesk.Infrastructure.Security;
using Xunit;

namespace LogiDesk.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_ShouldReturnValidSaltedHash()
    {
        var rawPassword = "StrongSecretPassword123!";
        var hash = _hasher.HashPassword(rawPassword);

        Assert.NotNull(hash);
        Assert.NotEmpty(hash);
        Assert.Contains(".", hash);
        
        var parts = hash.Split('.');
        Assert.Equal(3, parts.Length);
        Assert.Equal("100000", parts[0]); // 100k iterations
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
    {
        var rawPassword = "ValidPassword@2026";
        var hash = _hasher.HashPassword(rawPassword);

        var isValid = _hasher.VerifyPassword(hash, rawPassword);

        Assert.True(isValid);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
    {
        var rawPassword = "ValidPassword@2026";
        var hash = _hasher.HashPassword(rawPassword);

        var isValid = _hasher.VerifyPassword(hash, "WrongPassword");

        Assert.False(isValid);
    }

    [Fact]
    public void HashPassword_ShouldGenerateUniqueSalts_ForSamePassword()
    {
        var password = "SamePasswordAcrossUsers";
        var hash1 = _hasher.HashPassword(password);
        var hash2 = _hasher.HashPassword(password);

        Assert.NotEqual(hash1, hash2);
        Assert.True(_hasher.VerifyPassword(hash1, password));
        Assert.True(_hasher.VerifyPassword(hash2, password));
    }
}
