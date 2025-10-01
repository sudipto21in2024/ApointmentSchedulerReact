using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Hangfire; // Add using directive for Hangfire

namespace NotificationService.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public NotificationService(ApplicationDbContext context, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _backgroundJobClient = backgroundJobClient;
        }

        public async Task SendNotificationAsync(SendNotificationDto notificationDto)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = notificationDto.UserId,
                Title = notificationDto.Title,
                Message = notificationDto.Message,
                Type = notificationDto.Type,
                IsRead = false,
                SentAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Enqueue Hangfire job to send the notification in the background
            _backgroundJobClient.Enqueue<NotificationService>(x => x.SendNotificationJob(notification.Id));

            Console.WriteLine($"Notification enqueued: {notification.Title} to user {notification.UserId}");
        }

        // This method will be called by Hangfire
        public async Task SendNotificationJob(Guid notificationId)
        {
            // Retrieve notification details from DB using notificationId
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
            {
                // Log error: Notification not found
                Console.WriteLine($"Error: Notification with ID {notificationId} not found for sending.");
                return;
            }

            // In a real-world scenario, this would involve integrating with
            // email/SMS/push notification providers based on notification.Type
            // For now, we'll just simulate sending and update status
            Console.WriteLine($"Simulating sending {notification.Type} notification: '{notification.Title}' to user {notification.UserId}");

            // Update notification status in DB (e.g., Sent, Failed, Delivered)
            notification.Status = "Sent"; // Assuming successful send for now
            // In a real system, this would depend on the actual outcome of the external provider call
            await _context.SaveChangesAsync();
        }

        public async Task<NotificationPreferenceDto> GetNotificationPreferencesAsync(Guid userId)
        {
            var preferences = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preferences == null)
            {
                // Return default preferences if none are found
                return new NotificationPreferenceDto
                {
                    UserId = userId,
                    EmailEnabled = true,
                    SmsEnabled = true,
                    PushEnabled = true
                };
            }

            return new NotificationPreferenceDto
            {
                UserId = preferences.UserId,
                EmailEnabled = preferences.EmailEnabled,
                SmsEnabled = preferences.SmsEnabled,
                PushEnabled = preferences.PushEnabled,
                PreferredTimezone = preferences.PreferredTimezone
            };
        }

        public async Task UpdateNotificationPreferencesAsync(Guid userId, NotificationPreferenceDto preferencesDto)
        {
            var preferences = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preferences == null)
            {
                preferences = new NotificationPreference
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    EmailEnabled = preferencesDto.EmailEnabled,
                    SmsEnabled = preferencesDto.SmsEnabled,
                    PushEnabled = preferencesDto.PushEnabled,
                    PreferredTimezone = preferencesDto.PreferredTimezone
                };
                _context.NotificationPreferences.Add(preferences);
            }
            else
            {
                preferences.EmailEnabled = preferencesDto.EmailEnabled;
                preferences.SmsEnabled = preferencesDto.SmsEnabled;
                preferences.PushEnabled = preferencesDto.PushEnabled;
                preferences.PreferredTimezone = preferencesDto.PreferredTimezone;
                _context.NotificationPreferences.Update(preferences);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<NotificationHistoryDto[]> GetNotificationHistoryAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.SentAt)
                .Select(n => new NotificationHistoryDto
                {
                    Id = n.Id,
                    UserId = n.UserId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    SentAt = n.SentAt,
                    Status = "Sent", // Placeholder, as delivery status tracking is not fully implemented here
                    RelatedEntityId = n.RelatedEntityId
                })
                .ToArrayAsync();
        }
    }
}