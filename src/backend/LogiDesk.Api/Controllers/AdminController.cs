using LogiDesk.Application.DTOs;
using LogiDesk.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogiDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;

    public AdminController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// List all registered users (Admin only)
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Update user active/inactive status (Admin only)
    /// </summary>
    [HttpPut("users/{userId:int}/status")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UpdateStatusRequest request)
    {
        var updated = await _userService.UpdateUserStatusAsync(userId, request.IsActive);
        return Ok(updated);
    }

    /// <summary>
    /// Update user role (Admin only)
    /// </summary>
    [HttpPut("users/{userId:int}/role")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] UpdateRoleRequest request)
    {
        var updated = await _userService.UpdateUserRoleAsync(userId, request.Role);
        return Ok(updated);
    }
}
