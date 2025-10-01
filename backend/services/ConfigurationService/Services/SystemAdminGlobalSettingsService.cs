using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Threading.Tasks;

namespace ConfigurationService.Services
{
    /// <summary>
    /// Implementation of the ISystemAdminGlobalSettingsService interface for global settings management operations
    /// </summary>
    public class SystemAdminGlobalSettingsService : ISystemAdminGlobalSettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SystemAdminGlobalSettingsService> _logger;

        /// <summary>
        /// Initializes a new instance of the SystemAdminGlobalSettingsService class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public SystemAdminGlobalSettingsService(ApplicationDbContext context, ILogger<SystemAdminGlobalSettingsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets the global settings
        /// </summary>
        /// <returns>Global settings</returns>
        public async Task<GlobalSettings> GetGlobalSettingsAsync()
        {
            try
            {
                var settings = await _context.GlobalSettings.FirstOrDefaultAsync();

                if (settings == null)
                {
                    // Create default settings if none exist
                    settings = new GlobalSettings
                    {
                        Id = Guid.NewGuid(),
                        MaintenanceMode = false,
                        DefaultTimezone = "UTC",
                        MaxUsersPerTenant = 100,
                        MaxAppointmentsPerTenant = 1000,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.GlobalSettings.Add(settings);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Default global settings created");
                }

                return settings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving global settings");
                throw;
            }
        }

        /// <summary>
        /// Updates the global settings
        /// </summary>
        /// <param name="request">Update global settings request</param>
        /// <param name="updatedBy">User who is updating</param>
        /// <returns>Updated global settings</returns>
        public async Task<GlobalSettings> UpdateGlobalSettingsAsync(UpdateGlobalSettingsRequest request, Guid updatedBy)
        {
            try
            {
                var settings = await _context.GlobalSettings.FirstOrDefaultAsync();

                if (settings == null)
                {
                    // Create new settings
                    settings = new GlobalSettings
                    {
                        Id = Guid.NewGuid(),
                        MaintenanceMode = request.MaintenanceMode,
                        DefaultTimezone = request.DefaultTimezone,
                        MaxUsersPerTenant = request.MaxUsersPerTenant,
                        MaxAppointmentsPerTenant = request.MaxAppointmentsPerTenant,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = updatedBy
                    };

                    _context.GlobalSettings.Add(settings);
                }
                else
                {
                    // Update existing settings
                    settings.MaintenanceMode = request.MaintenanceMode;
                    settings.DefaultTimezone = request.DefaultTimezone;
                    settings.MaxUsersPerTenant = request.MaxUsersPerTenant;
                    settings.MaxAppointmentsPerTenant = request.MaxAppointmentsPerTenant;
                    settings.UpdatedAt = DateTime.UtcNow;
                    settings.UpdatedBy = updatedBy;

                    _context.GlobalSettings.Update(settings);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Global settings updated by user {UserId}", updatedBy);
                return settings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating global settings");
                throw;
            }
        }
    }
}