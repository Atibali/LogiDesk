using LogiDesk.Application.DTOs;
using LogiDesk.Application.Exceptions;
using LogiDesk.Application.Interfaces;
using LogiDesk.Domain.Entities;
using LogiDesk.Domain.Enums;
using LogiDesk.Domain.Interfaces;

namespace LogiDesk.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.EmailExistsAsync(normalizedEmail))
        {
            throw new ValidationException("An account with this email address already exists.");
        }

        var hashedPassword = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = hashedPassword,
            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _userRepository.AddAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(createdUser);

        return new AuthResponse
        {
            Token = token,
            User = MapToDto(createdUser)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail);

        if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, request.Password))
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new AuthenticationException("Your account has been deactivated. Please contact an administrator.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            User = MapToDto(user)
        };
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
