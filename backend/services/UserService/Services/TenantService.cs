using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.Models;
using UserService.DTO;

namespace UserService.Services
{
    public class TenantService : ITenantService
    {
        private readonly ApplicationDbContext _dbContext;

        public TenantService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Tenant> CreateTenantAsync(CreateTenantRequest request)
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Subdomain = request.Name.ToLower().Replace(" ", "").Replace("-", ""),
                Domain = request.Domain,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LogoUrl = request.LogoUrl,
                ContactEmail = request.ContactEmail
            };

            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();
            return tenant;
        }

        public async Task<Tenant?> GetTenantByIdAsync(Guid id)
        {
            return await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Tenant>> GetAllTenantsAsync()
        {
            return await _dbContext.Tenants.IgnoreQueryFilters().ToListAsync();
        }

        public async Task<Tenant?> UpdateTenantAsync(Guid id, UpdateTenantRequest request)
        {
            var tenant = await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id);
            if (tenant == null)
            {
                return null;
            }

            if (request.Name != null)
            {
                tenant.Name = request.Name;
            }
            if (request.Description != null)
            {
                tenant.Description = request.Description;
            }
            if (request.Domain != null)
            {
                tenant.Domain = request.Domain;
            }
            if (request.IsActive != null)
            {
                tenant.IsActive = request.IsActive.Value;
            }
            if (request.LogoUrl != null)
            {
                tenant.LogoUrl = request.LogoUrl;
            }
            if (request.ContactEmail != null)
            {
                tenant.ContactEmail = request.ContactEmail;
            }

            tenant.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return tenant;
        }

        public async Task<bool> DeleteTenantAsync(Guid id)
        {
            var tenant = await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == id);
            if (tenant == null)
            {
                return false;
            }

            _dbContext.Tenants.Remove(tenant);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}