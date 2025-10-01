using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ConfigurationService.Services;

namespace ConfigurationService.Controllers
{
    [ApiController]
    [Route("system-admin/global-settings")]
    [Authorize(Roles = "SuperAdmin")]
    public class SystemAdminGlobalSettingsController : ControllerBase
    {
        private readonly ISystemAdminGlobalSettingsService _globalSettingsService;
        private readonly ILogger<SystemAdminGlobalSettingsController> _logger;

        public SystemAdminGlobalSettingsController(
            ISystemAdminGlobalSettingsService globalSettingsService,
            ILogger<SystemAdminGlobalSettingsController> logger)
        {
            _globalSettingsService = globalSettingsService;
            _logger = logger;
        }

        /// <summary>
        /// Get global system settings
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(GlobalSettings), 200)]
        public async Task<IActionResult> GetGlobalSettings()
        {
            try
            {
                var settings = await _globalSettingsService.GetGlobalSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving global settings");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update global system settings
        /// </summary>
        [HttpPut]
        [ProducesResponseType(typeof(GlobalSettings), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> UpdateGlobalSettings([FromBody] UpdateGlobalSettingsRequest request)
        {
            try
            {
                // Get current user ID from claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return Unauthorized("Invalid user identity");
                }

                var settings = await _globalSettingsService.UpdateGlobalSettingsAsync(request, userId);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating global settings");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}