using Shared.Models;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Shared.DTOs;

namespace TenantManagementService.Services
{
    /// <summary>
    /// Implementation of the ISystemAdminTenantService interface for tenant management operations
    /// </summary>
    public class SystemAdminTenantService : ISystemAdminTenantService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SystemAdminTenantService> _logger;

        /// <summary>
        /// Initializes a new instance of the SystemAdminTenantService class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public SystemAdminTenantService(ApplicationDbContext context, ILogger<SystemAdminTenantService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets all tenants with pagination
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Number of items per page</param>
        /// <param name="sort">Sort field</param>
        /// <param name="order">Sort order</param>
        /// <returns>Paginated list of tenants</returns>
        public async Task<TenantListDto> GetAllTenantsAsync(int page = 1, int pageSize = 10, string? sort = null, string? order = "desc")
        {
            try
            {
                var query = _context.Tenants.Where(t => !t.IsDeleted).AsQueryable();

                // Apply sorting
                if (!string.IsNullOrEmpty(sort))
                {
                    query = order?.ToLower() == "asc"
                        ? query.OrderBy(t => EF.Property<object>(t, sort))
                        : query.OrderByDescending(t => EF.Property<object>(t, sort));
                }
                else
                {
                    query = query.OrderByDescending(t => t.CreatedAt);
                }

                var totalCount = await query.CountAsync();
                var tenants = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var tenantDtos = tenants.Select(MapToDto).ToList();

                return new TenantListDto
                {
                    Tenants = tenantDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenants");
                throw;
            }
        }

        /// <summary>
        /// Gets a tenant by ID
        /// </summary>
        /// <param name="id">Tenant ID</param>
        /// <returns>Tenant DTO</returns>
        public async Task<TenantDto> GetTenantByIdAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    throw new KeyNotFoundException($"Tenant {id} not found");
                }

                return MapToDto(tenant);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException))
            {
                _logger.LogError(ex, "Error retrieving tenant {TenantId}", id);
                throw;
            }
        }

        /// <summary>
        /// Creates a new tenant
        /// </summary>
        /// <param name="request">Create tenant request</param>
        /// <returns>Created tenant DTO</returns>
        public async Task<TenantDto> CreateTenantAsync(CreateTenantRequest request)
        {
            try
            {
                // Check for unique constraints
                var existingSubdomain = await _context.Tenants
                    .AnyAsync(t => t.Subdomain == request.Subdomain && !t.IsDeleted);
                if (existingSubdomain)
                {
                    throw new InvalidOperationException("Subdomain already exists");
                }

                var existingEmail = await _context.Tenants
                    .AnyAsync(t => t.ContactEmail == request.AdminEmail && !t.IsDeleted);
                if (existingEmail)
                {
                    throw new InvalidOperationException("Admin email already exists");
                }

                var tenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    Subdomain = request.Subdomain,
                    Status = TenantStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    LogoUrl = request.LogoUrl,
                    ContactEmail = request.AdminEmail,
                    IsDeleted = false
                };

                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Tenant {TenantId} created successfully", tenant.Id);
                return MapToDto(tenant);
            }
            catch (Exception ex) when (!(ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Error creating tenant");
                throw;
            }
        }

        /// <summary>
        /// Updates an existing tenant
        /// </summary>
        /// <param name="id">Tenant ID</param>
        /// <param name="request">Update tenant request</param>
        /// <returns>Updated tenant DTO</returns>
        public async Task<TenantDto> UpdateTenantAsync(Guid id, UpdateTenantRequest request)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    throw new KeyNotFoundException($"Tenant {id} not found");
                }

                // Check unique constraints if updating
                if (!string.IsNullOrEmpty(request.Subdomain) && request.Subdomain != tenant.Subdomain)
                {
                    var existingSubdomain = await _context.Tenants
                        .AnyAsync(t => t.Subdomain == request.Subdomain && t.Id != id && !t.IsDeleted);
                    if (existingSubdomain)
                    {
                        throw new InvalidOperationException("Subdomain already exists");
                    }
                }

                if (!string.IsNullOrEmpty(request.AdminEmail) && request.AdminEmail != tenant.ContactEmail)
                {
                    var existingEmail = await _context.Tenants
                        .AnyAsync(t => t.ContactEmail == request.AdminEmail && t.Id != id && !t.IsDeleted);
                    if (existingEmail)
                    {
                        throw new InvalidOperationException("Admin email already exists");
                    }
                }

                // Update properties
                if (!string.IsNullOrEmpty(request.Name))
                    tenant.Name = request.Name;
                if (!string.IsNullOrEmpty(request.Description))
                    tenant.Description = request.Description;
                if (!string.IsNullOrEmpty(request.Subdomain))
                    tenant.Subdomain = request.Subdomain;
                if (!string.IsNullOrEmpty(request.LogoUrl))
                    tenant.LogoUrl = request.LogoUrl;
                if (!string.IsNullOrEmpty(request.AdminEmail))
                    tenant.ContactEmail = request.AdminEmail;
                if (request.Status.HasValue)
                    tenant.Status = request.Status.Value;

                tenant.UpdatedAt = DateTime.UtcNow;

                _context.Tenants.Update(tenant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Tenant {TenantId} updated successfully", id);
                return MapToDto(tenant);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException || ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Error updating tenant {TenantId}", id);
                throw;
            }
        }

        /// <summary>
        /// Soft deletes a tenant
        /// </summary>
        /// <param name="id">Tenant ID</param>
        public async Task DeleteTenantAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    throw new KeyNotFoundException($"Tenant {id} not found");
                }

                tenant.IsDeleted = true;
                tenant.DeletedAt = DateTime.UtcNow;
                tenant.UpdatedAt = DateTime.UtcNow;

                _context.Tenants.Update(tenant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Tenant {TenantId} soft deleted successfully", id);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException))
            {
                _logger.LogError(ex, "Error deleting tenant {TenantId}", id);
                throw;
            }
        }

        /// <summary>
        /// Updates tenant status
        /// </summary>
        /// <param name="id">Tenant ID</param>
        /// <param name="request">Update status request</param>
        /// <returns>Updated tenant DTO</returns>
        public async Task<TenantDto> UpdateTenantStatusAsync(Guid id, UpdateTenantStatusRequest request)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    throw new KeyNotFoundException($"Tenant {id} not found");
                }

                tenant.Status = request.Status;
                tenant.UpdatedAt = DateTime.UtcNow;

                _context.Tenants.Update(tenant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Tenant {TenantId} status updated to {Status}", id, request.Status);
                return MapToDto(tenant);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException))
            {
                _logger.LogError(ex, "Error updating tenant status {TenantId}", id);
                throw;
            }
        }

        private static TenantDto MapToDto(Tenant tenant)
        {
            return new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Description = tenant.Description,
                Subdomain = tenant.Subdomain,
                Status = tenant.Status,
                CreatedAt = tenant.CreatedAt,
                UpdatedAt = tenant.UpdatedAt,
                LogoUrl = tenant.LogoUrl,
                AdminEmail = tenant.ContactEmail
            };
        }
    }
}