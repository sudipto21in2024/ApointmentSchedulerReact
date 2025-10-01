using System;
using System.Threading.Tasks;
using Shared.DTOs;
using Shared.Models;

namespace NotificationService.Services
{
    public interface INotificationService
    {
        Task SendNotificationAsync(SendNotificationDto notificationDto);
        Task<NotificationPreferenceDto> GetNotificationPreferencesAsync(Guid userId);
        Task UpdateNotificationPreferencesAsync(Guid userId, NotificationPreferenceDto preferencesDto);
        Task<NotificationHistoryDto[]> GetNotificationHistoryAsync(Guid userId);
    }
}