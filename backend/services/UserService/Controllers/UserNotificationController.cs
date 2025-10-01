using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;
using Shared.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using UserService.Utils;
using Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace UserService.Controllers
{
    [ApiController]
    [Route("users/{userId}/notification-preferences")]
    [Authorize]
    public class UserNotificationController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserNotificationController> _logger;
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.UserNotificationController");

        public UserNotificationController(IUserService userService, ILogger<UserNotificationController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotificationPreferences(Guid userId)
        {
            using var activity = ActivitySource.StartActivity("UserNotificationController.GetNotificationPreferences");
            activity?.SetTag("user.id", userId.ToString());

            LoggingExtensions.AddTraceIdToLogContext();

            try
            {
                // Check if the user is authorized to access this resource
                var currentUserId = GetCurrentUserId();
                if (currentUserId != userId)
                {
                    _logger.LogWarning("Unauthorized access attempt to notification preferences for user {UserId} by user {CurrentUserId}", userId, currentUserId);
                    activity?.SetStatus(ActivityStatusCode.Error, "Unauthorized access");
                    return Forbid();
                }

                var preferences = await _userService.GetNotificationPreferencesAsync(userId);
                if (preferences == null)
                {
                    activity?.SetStatus(ActivityStatusCode.Error, "Preferences not found");
                    return NotFound("Notification preferences not found");
                }

                activity?.SetStatus(ActivityStatusCode.Ok);
                return Ok(new { data = preferences });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification preferences for user {UserId}", userId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateNotificationPreferences(Guid userId, [FromBody] UpdateNotificationPreferencesRequest request)
        {
            using var activity = ActivitySource.StartActivity("UserNotificationController.UpdateNotificationPreferences");
            activity?.SetTag("user.id", userId.ToString());

            LoggingExtensions.AddTraceIdToLogContext();

            try
            {
                // Check if the user is authorized to update this resource
                var currentUserId = GetCurrentUserId();
                if (currentUserId != userId)
                {
                    _logger.LogWarning("Unauthorized update attempt to notification preferences for user {UserId} by user {CurrentUserId}", userId, currentUserId);
                    activity?.SetStatus(ActivityStatusCode.Error, "Unauthorized access");
                    return Forbid();
                }

                // Validate request
                if (!ModelState.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error, "Invalid request model");
                    return BadRequest(ModelState);
                }

                var updatedPreferences = await _userService.UpdateNotificationPreferencesAsync(userId, new NotificationPreference
                {
                    EmailEnabled = request.EmailEnabled,
                    SmsEnabled = request.SmsEnabled,
                    PushEnabled = request.PushEnabled,
                    PreferredTimezone = request.PreferredTimezone
                });

                activity?.SetStatus(ActivityStatusCode.Ok);
                return Ok(new { data = updatedPreferences });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences for user {UserId}", userId);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        private Guid GetCurrentUserId()
        {
            // Extract user ID from JWT token claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }

            throw new UnauthorizedAccessException("Unable to determine current user ID");
        }
    }
}