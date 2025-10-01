using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Moq;
using Shared.Models;
using UserService.Services;
using UserService.Utils;
using Xunit;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace UserService.Tests.Utils
{
    public class TenantResolutionServiceTests
    {
        private readonly Mock<ITenantService> _mockTenantService;
        private readonly Mock<ILogger<TenantResolutionService>> _mockLogger;
        private readonly TenantResolutionService _tenantResolutionService;

        public TenantResolutionServiceTests()
        {
            _mockTenantService = new Mock<ITenantService>();
            _mockLogger = new Mock<ILogger<TenantResolutionService>>();
            _tenantResolutionService = new TenantResolutionService(_mockTenantService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task ResolveTenantAsync_ShouldReturnSuperAdminResult_WhenHostIsSuperAdmin()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Host = new HostString("admin.localhost"); // Assuming localhost for testing

            // Act
            var result = await _tenantResolutionService.ResolveTenantAsync(httpContext);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsSuperAdmin);
            Assert.True(result.IsResolved);
            Assert.Null(result.TenantId);
            Assert.Null(result.Tenant);
        }

        [Fact]
        public async Task ResolveTenantAsync_ShouldReturnTenantResult_WhenHostMatchesActiveTenant()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var domain = "tenant1.localhost";
            var tenant = new Tenant { Id = tenantId, Domain = domain, IsActive = true };
            var tenants = new List<Tenant> { tenant };

            _mockTenantService.Setup(s => s.GetAllTenantsAsync()).ReturnsAsync(tenants);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Host = new HostString(domain);

            // Act
            var result = await _tenantResolutionService.ResolveTenantAsync(httpContext);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsSuperAdmin);
            Assert.True(result.IsResolved);
            Assert.Equal(tenantId, result.TenantId);
            Assert.Same(tenant, result.Tenant);
        }

        [Fact]
        public async Task ResolveTenantAsync_ShouldReturnUnresolvedResult_WhenHostDoesNotMatchAnyTenant()
        {
            // Arrange
            var tenants = new List<Tenant>
            {
                new Tenant { Id = Guid.NewGuid(), Domain = "tenant1.localhost", IsActive = true },
                new Tenant { Id = Guid.NewGuid(), Domain = "tenant2.localhost", IsActive = true }
            };

            _mockTenantService.Setup(s => s.GetAllTenantsAsync()).ReturnsAsync(tenants);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Host = new HostString("unknown.localhost");

            // Act
            var result = await _tenantResolutionService.ResolveTenantAsync(httpContext);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsSuperAdmin);
            Assert.False(result.IsResolved);
            Assert.Null(result.TenantId);
            Assert.Null(result.Tenant);
        }

        [Fact]
        public async Task ResolveTenantAsync_ShouldReturnUnresolvedResult_WhenMatchingTenantIsNotActive()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var domain = "tenant1.localhost";
            var tenant = new Tenant { Id = tenantId, Domain = domain, IsActive = false }; // Not active
            var tenants = new List<Tenant> { tenant };

            _mockTenantService.Setup(s => s.GetAllTenantsAsync()).ReturnsAsync(tenants);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Host = new HostString(domain);

            // Act
            var result = await _tenantResolutionService.ResolveTenantAsync(httpContext);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsSuperAdmin);
            Assert.False(result.IsResolved);
            Assert.Null(result.TenantId);
            Assert.Null(result.Tenant);
        }

        [Fact]
        public async Task ResolveTenantAsync_ShouldHandleTenantWithNullDomain_Gracefully()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var domain = "tenant1.localhost";
            var tenantWithNullDomain = new Tenant { Id = Guid.NewGuid(), Domain = null, IsActive = true }; // Null domain
            var tenant = new Tenant { Id = tenantId, Domain = domain, IsActive = true };
            var tenants = new List<Tenant> { tenantWithNullDomain, tenant };

            _mockTenantService.Setup(s => s.GetAllTenantsAsync()).ReturnsAsync(tenants);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Host = new HostString(domain);

            // Act
            var result = await _tenantResolutionService.ResolveTenantAsync(httpContext);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsSuperAdmin);
            Assert.True(result.IsResolved);
            Assert.Equal(tenantId, result.TenantId);
            Assert.Same(tenant, result.Tenant);
        }
    }
}