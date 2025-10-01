namespace Shared.Contracts
{
    public interface IAuthenticationService
    {
        Task<(Shared.Models.User?, string?)> Authenticate(string username, string password, bool isSuperAdmin, Guid? tenantId);
        string GenerateToken(Shared.Models.User user);
        string GenerateRefreshToken(Shared.Models.User user);
        bool ValidateRefreshToken(string refreshToken);
        Shared.Models.User? GetUserFromRefreshToken(string refreshToken);
        bool InvalidateRefreshToken(string refreshToken);
        bool ValidateJwtToken(string token);
        Task<bool> ChangePassword(Shared.Models.User user, string newPassword);
    }
}