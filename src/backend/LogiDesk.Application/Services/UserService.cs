using LogiDesk.Application.DTOs;
using LogiDesk.Application.Exceptions;
using LogiDesk.Application.Interfaces;
using LogiDesk.Domain.Entities;
using LogiDesk.Domain.Enums;
using LogiDesk.Domain.Interfaces;

namespace LogiDesk.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    public async Task<IReadOnlyList<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<UserDto> UpdateUserRoleAsync(int userId, string roleName)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {userId} was not found.");
        }

        if (!Enum.TryParse<UserRole>(roleName, true, out var parsedRole))
        {
            throw new ValidationException($"Invalid role '{roleName}'. Allowed roles are Customer, SupportAgent, OperationsManager, Administrator.");
        }

        user.Role = parsedRole;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task<UserDto> UpdateUserStatusAsync(int userId, bool isActive)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {userId} was not found.");
        }

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
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
