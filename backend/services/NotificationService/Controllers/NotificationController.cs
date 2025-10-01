using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using NotificationService.Services;
using NotificationService.Validators;
using System;
using System.Threading.Tasks;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly INotificationValidator _notificationValidator;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(INotificationService notificationService, INotificationValidator notificationValidator, ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _notificationValidator = notificationValidator;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationDto notificationDto)
        {
            try
            {
                await _notificationValidator.ValidateSendNotificationAsync(notificationDto);
                await _notificationService.SendNotificationAsync(notificationDto);
                return Ok("Notification sent successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending the notification.");
                return StatusCode(500, "An error occurred while sending the notification.");
            }
        }

        [HttpGet("preferences/{userId}")]
        public async Task<IActionResult> GetNotificationPreferences(Guid userId)
        {
            try
            {
                var preferences = await _notificationService.GetNotificationPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving notification preferences.");
                return StatusCode(500, "An error occurred while retrieving notification preferences.");
            }
        }

        [HttpPut("preferences/{userId}")]
        public async Task<IActionResult> UpdateNotificationPreferences(Guid userId, [FromBody] NotificationPreferenceDto preferencesDto)
        {
            try
            {
                preferencesDto.UserId = userId; // Ensure the userId in the DTO matches the route parameter
                await _notificationValidator.ValidateUpdateNotificationPreferencesAsync(preferencesDto);
                await _notificationService.UpdateNotificationPreferencesAsync(userId, preferencesDto);
                return Ok("Notification preferences updated successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating notification preferences.");
                return StatusCode(500, "An error occurred while updating notification preferences.");
            }
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetNotificationHistory(Guid userId)
        {
            try
            {
                var history = await _notificationService.GetNotificationHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving notification history.");
                return StatusCode(500, "An error occurred while retrieving notification history.");
            }
        }
    }
}