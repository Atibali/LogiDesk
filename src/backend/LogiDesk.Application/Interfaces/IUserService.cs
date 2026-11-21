using LogiDesk.Application.DTOs;

namespace LogiDesk.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetProfileAsync(int userId);
    Task<IReadOnlyList<UserDto>> GetAllUsersAsync();
    Task<UserDto> UpdateUserRoleAsync(int userId, string role);
    Task<UserDto> UpdateUserStatusAsync(int userId, bool isActive);
}
