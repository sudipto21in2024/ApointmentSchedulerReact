using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace TenantManagementService.Services
{
    public interface ISystemAdminTenantService
    {
        Task<TenantListDto> GetAllTenantsAsync(int page = 1, int pageSize = 10, string? sort = null, string? order = "desc");
        Task<TenantDto> GetTenantByIdAsync(Guid id);
        Task<TenantDto> CreateTenantAsync(CreateTenantRequest request);
        Task<TenantDto> UpdateTenantAsync(Guid id, UpdateTenantRequest request);
        Task DeleteTenantAsync(Guid id);
        Task<TenantDto> UpdateTenantStatusAsync(Guid id, UpdateTenantStatusRequest request);
    }
}