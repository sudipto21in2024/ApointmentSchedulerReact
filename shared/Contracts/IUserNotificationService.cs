using System.Threading.Tasks;
using Shared.Models;
using Shared.DTOs;

namespace Shared.Contracts
{
    public interface IUserNotificationService
    {
        Task<NotificationPreference?> GetNotificationPreferencesAsync(Guid userId);
        Task<NotificationPreference> UpdateNotificationPreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request);
    }
}