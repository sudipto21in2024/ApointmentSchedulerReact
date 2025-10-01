using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Models;
using UserService.DTO;

namespace UserService.Services
{
    public interface ITenantService
    {
        Task<Tenant> CreateTenantAsync(CreateTenantRequest request);
        Task<Tenant?> GetTenantByIdAsync(Guid id);
        Task<IEnumerable<Tenant>> GetAllTenantsAsync();
        Task<Tenant?> UpdateTenantAsync(Guid id, UpdateTenantRequest request);
        Task<bool> DeleteTenantAsync(Guid id);
    }
}