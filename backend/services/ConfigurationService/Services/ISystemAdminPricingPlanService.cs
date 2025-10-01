using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace ConfigurationService.Services
{
    public interface ISystemAdminPricingPlanService
    {
        Task<PricingPlanListDto> GetAllPricingPlansAsync(int page = 1, int pageSize = 10, string? sort = null, string? order = "desc");
        Task<PricingPlanDto> GetPricingPlanByIdAsync(Guid id);
        Task<PricingPlanDto> CreatePricingPlanAsync(CreatePricingPlanRequest request);
        Task<PricingPlanDto> UpdatePricingPlanAsync(Guid id, UpdatePricingPlanRequest request);
        Task<PricingPlanDto> UpdatePricingPlanStatusAsync(Guid id, UpdatePricingPlanStatusRequest request);
    }
}