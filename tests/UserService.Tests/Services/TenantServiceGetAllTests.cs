using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shared.Data;
using Shared.Models;
using UserService.Services;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace UserService.Tests.Services
{
    public class TenantServiceGetAllTests
    {
        [Fact]
        public async Task GetAllTenantsAsync_ShouldReturnAllTenants()
        {
            // Arrange - use separate context for this test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var testDbContext = new ApplicationDbContext(options, mockHttpContextAccessor.Object);
            testDbContext.Database.EnsureCreated();

            var testTenants = new List<Tenant>
            {
                new Tenant { Id = Guid.NewGuid(), Name = "Tenant A", Subdomain = "tenantA", ContactEmail = "admin@tenantA.com", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Tenant { Id = Guid.NewGuid(), Name = "Tenant B", Subdomain = "tenantB", ContactEmail = "admin@tenantB.com", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };
            testDbContext.Tenants.AddRange(testTenants);
            testDbContext.SaveChanges();

            var testTenantService = new TenantService(testDbContext);

            // Act
            var result = await testTenantService.GetAllTenantsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(testTenants.Count + 1, result.Count()); // +1 for seeded admin tenant
        }
    }
}