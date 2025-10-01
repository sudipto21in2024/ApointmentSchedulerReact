using Shared.DTOs;
using Shared.Models;
using System.Threading.Tasks;

namespace NotificationService.Validators
{
    public interface INotificationValidator
    {
        Task ValidateSendNotificationAsync(SendNotificationDto notificationDto);
        Task ValidateUpdateNotificationPreferencesAsync(NotificationPreferenceDto preferencesDto);
    }
}