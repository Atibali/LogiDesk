using LogiDesk.Domain.Entities;

namespace LogiDesk.Domain.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
