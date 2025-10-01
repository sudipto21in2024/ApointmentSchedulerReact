using System.Threading.Tasks;
using Shared.DTOs;
using Shared.Models;

namespace ConfigurationService.Services
{
    public interface ISystemAdminGlobalSettingsService
    {
        Task<GlobalSettings> GetGlobalSettingsAsync();
        Task<GlobalSettings> UpdateGlobalSettingsAsync(UpdateGlobalSettingsRequest request, Guid updatedBy);
    }
}