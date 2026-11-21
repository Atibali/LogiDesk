using System.ComponentModel.DataAnnotations;

namespace LogiDesk.Application.DTOs;

public class UpdateRoleRequest
{
    [Required(ErrorMessage = "Role is required.")]
    public string Role { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    [Required]
    public bool IsActive { get; set; }
}
