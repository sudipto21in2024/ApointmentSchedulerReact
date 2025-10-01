using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using UserService.Services; // Assuming ITenantService is here
using Shared.Models;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace UserService.Utils
{
    public class TenantResolutionResult
    {
        public bool IsSuperAdmin { get; set; }
        public Guid? TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        public bool IsResolved { get; set; }
    }

    public interface ITenantResolutionService
    {
        Task<TenantResolutionResult> ResolveTenantAsync(HttpContext httpContext);
    }

    public class TenantResolutionService : ITenantResolutionService
    {
        private readonly ITenantService _tenantService;
        private readonly ILogger<TenantResolutionService> _logger;
        // Define the super admin subdomain prefix
        private const string SuperAdminSubdomainPrefix = "admin";

        public TenantResolutionService(ITenantService tenantService, ILogger<TenantResolutionService> logger)
        {
            _tenantService = tenantService;
            _logger = logger;
        }

        public async Task<TenantResolutionResult> ResolveTenantAsync(HttpContext httpContext)
        {
            var host = httpContext.Request.Host.Host; // Gets the hostname without port
            _logger.LogInformation("Resolving tenant for host: {Host}", host);

            // Check for SuperAdmin
            if (IsSuperAdminRequest(host))
            {
                _logger.LogInformation("Request identified as SuperAdmin.");
                return new TenantResolutionResult
                {
                    IsSuperAdmin = true,
                    IsResolved = true
                };
            }

            // Resolve tenant by domain
            var tenant = await FindTenantByDomainAsync(host);
            if (tenant != null)
            {
                _logger.LogInformation("Tenant resolved: {TenantId} for domain {Domain}", tenant.Id, host);
                return new TenantResolutionResult
                {
                    IsSuperAdmin = false,
                    TenantId = tenant.Id,
                    Tenant = tenant,
                    IsResolved = true
                };
            }

            _logger.LogWarning("Unable to resolve tenant for host: {Host}", host);
            return new TenantResolutionResult
            {
                IsResolved = false
                // IsSuperAdmin and TenantId remain default (false, null)
            };
        }

        private bool IsSuperAdminRequest(string host)
        {
            // This assumes the format is "admin.yourdomain.com"
            // You might need to adjust this logic based on your actual domain structure
            // e.g., if your main domain is "yourdomain.com", then "admin.yourdomain.com" is SuperAdmin
            // For localhost, it would be "admin.localhost"
            return host.StartsWith($"{SuperAdminSubdomainPrefix}.", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<Tenant?> FindTenantByDomainAsync(string domain)
        {
            // This assumes the Tenant entity has a "Domain" property that stores the full domain name
            // e.g., "tenant1.yourdomain.com" or "tenant1.localhost"
            // We need to find a tenant whose Domain matches the incoming request host.
            var allTenants = await _tenantService.GetAllTenantsAsync();
            return allTenants.FirstOrDefault(t => t.Domain != null && t.Domain.Equals(domain, StringComparison.OrdinalIgnoreCase) && t.IsActive);
        }
    }
}