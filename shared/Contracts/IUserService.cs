using Shared.Models;
using System.Threading.Tasks;

namespace Shared.Contracts
{
    public interface IUserService
    {
        Task<User?> GetUserByUsername(string email);
        Task<User?> GetUserByUsernameAndTenantAsync(string email, Guid tenantId);
        Task<User?> GetSuperAdminUserByUsernameAsync(string email);
        Task<bool> UpdatePassword(User user, string newPassword);
        Task<User?> GetUserById(Guid id);
        Task<User> CreateUser(User user);
        Task<User?> UpdateUser(User user);
        Task<bool> DeleteUser(Guid id);
        Task<NotificationPreference?> GetNotificationPreferencesAsync(Guid userId);
        Task<NotificationPreference> UpdateNotificationPreferencesAsync(Guid userId, NotificationPreference preferences);
    }
}