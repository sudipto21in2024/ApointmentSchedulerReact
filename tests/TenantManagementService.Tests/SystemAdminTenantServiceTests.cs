using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TenantManagementService.Services;
using Xunit;

namespace TenantManagementService.Tests
{
    public class SystemAdminTenantServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<SystemAdminTenantService>> _loggerMock;
        private readonly SystemAdminTenantService _service;

        public SystemAdminTenantServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
    
            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _context = new ApplicationDbContext(options, httpContextAccessorMock.Object);
            _loggerMock = new Mock<ILogger<SystemAdminTenantService>>();
            _service = new SystemAdminTenantService(_context, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateTenantAsync_ValidRequest_CreatesTenant()
        {
            // Arrange
            var request = new CreateTenantRequest
            {
                Name = "Test Tenant",
                Subdomain = "testtenant",
                AdminEmail = "admin@test.com"
            };

            // Act
            var result = await _service.CreateTenantAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Subdomain, result.Subdomain);
            Assert.Equal(request.AdminEmail, result.AdminEmail);
            Assert.Equal(TenantStatus.Active, result.Status);

            var tenantInDb = await _context.Tenants.FindAsync(result.Id);
            Assert.NotNull(tenantInDb);
            Assert.False(tenantInDb.IsDeleted);
        }

        [Fact]
        public async Task CreateTenantAsync_DuplicateSubdomain_ThrowsException()
        {
            // Arrange
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Existing Tenant",
                Subdomain = "testtenant",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ContactEmail = "existing@test.com",
                IsDeleted = false
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var request = new CreateTenantRequest
            {
                Name = "New Tenant",
                Subdomain = "testtenant", // duplicate
                AdminEmail = "new@test.com"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateTenantAsync(request));
        }

        [Fact]
        public async Task GetTenantByIdAsync_ExistingTenant_ReturnsTenant()
        {
            // Arrange
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "testtenant",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ContactEmail = "admin@test.com",
                IsDeleted = false
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetTenantByIdAsync(tenant.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(tenant.Id, result.Id);
            Assert.Equal(tenant.Name, result.Name);
        }

        [Fact]
        public async Task GetTenantByIdAsync_NonExistingTenant_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetTenantByIdAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task UpdateTenantStatusAsync_ValidRequest_UpdatesStatus()
        {
            // Arrange
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "testtenant",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ContactEmail = "admin@test.com",
                IsDeleted = false
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var request = new UpdateTenantStatusRequest
            {
                Status = TenantStatus.Suspended
            };

            // Act
            var result = await _service.UpdateTenantStatusAsync(tenant.Id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(TenantStatus.Suspended, result.Status);

            var updatedTenant = await _context.Tenants.FindAsync(tenant.Id);
            Assert.Equal(TenantStatus.Suspended, updatedTenant.Status);
        }

        [Fact]
        public async Task DeleteTenantAsync_ExistingTenant_SoftDeletes()
        {
            // Arrange
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "testtenant",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ContactEmail = "admin@test.com",
                IsDeleted = false
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            // Act
            await _service.DeleteTenantAsync(tenant.Id);

            // Assert
            var deletedTenant = await _context.Tenants.FindAsync(tenant.Id);
            Assert.True(deletedTenant.IsDeleted);
            Assert.NotNull(deletedTenant.DeletedAt);
        }
    }
}