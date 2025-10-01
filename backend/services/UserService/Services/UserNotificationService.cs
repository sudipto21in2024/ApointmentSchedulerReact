using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using Shared.DTOs;
using UserService.Utils;
using Shared.Contracts;

namespace UserService.Services
{
    public class UserNotificationService : Shared.Contracts.IUserNotificationService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.UserNotificationService");
        private readonly Shared.Data.ApplicationDbContext _context;
        private readonly ILogger<UserNotificationService> _logger;

        public UserNotificationService(Shared.Data.ApplicationDbContext context, ILogger<UserNotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<NotificationPreference?> GetNotificationPreferencesAsync(Guid userId)
        {
            using var activity = ActivitySource.StartActivity("UserNotificationService.GetNotificationPreferencesAsync");
            activity?.SetTag("user.id", userId.ToString());

            LoggingExtensions.AddTraceIdToLogContext();

            try
            {
                var preference = await _context.NotificationPreferences
                    .FirstOrDefaultAsync(np => np.UserId == userId);

                if (preference == null)
                {
                    // Create default preferences for new users
                    // Get tenant from user
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                    if (user != null)
                    {
                        preference = new NotificationPreference
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            EmailEnabled = true,
                            SmsEnabled = true,
                            PushEnabled = true,
                            PreferredTimezone = null,
                            TenantId = user.TenantId
                        };

                        _context.NotificationPreferences.Add(preference);
                        await _context.SaveChangesAsync();
                    }
                }

                activity?.SetStatus(ActivityStatusCode.Ok);
                return preference;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification preferences for user {UserId}", userId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public async Task<NotificationPreference> UpdateNotificationPreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request)
        {
            using var activity = ActivitySource.StartActivity("UserNotificationService.UpdateNotificationPreferencesAsync");
            activity?.SetTag("user.id", userId.ToString());

            LoggingExtensions.AddTraceIdToLogContext();

            try
            {
                var preference = await _context.NotificationPreferences
                    .FirstOrDefaultAsync(np => np.UserId == userId);

                if (preference == null)
                {
                    // Create new preferences
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                    if (user == null)
                    {
                        throw new ArgumentException("User not found", nameof(userId));
                    }

                    preference = new NotificationPreference
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        EmailEnabled = request.EmailEnabled,
                        SmsEnabled = request.SmsEnabled,
                        PushEnabled = request.PushEnabled,
                        PreferredTimezone = request.PreferredTimezone,
                        TenantId = user.TenantId
                    };

                    _context.NotificationPreferences.Add(preference);
                }
                else
                {
                    // Update existing preferences
                    preference.EmailEnabled = request.EmailEnabled;
                    preference.SmsEnabled = request.SmsEnabled;
                    preference.PushEnabled = request.PushEnabled;
                    preference.PreferredTimezone = request.PreferredTimezone;

                    _context.NotificationPreferences.Update(preference);
                }

                await _context.SaveChangesAsync();

                activity?.SetStatus(ActivityStatusCode.Ok);
                return preference;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences for user {UserId}", userId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }
    }
}