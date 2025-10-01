using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Models;
using UserService.Controllers;
using UserService.DTO;
using UserService.Services;
using Xunit;

namespace UserService.Tests.Controllers
{
    public class TenantControllerTests
    {
        private readonly Mock<ITenantService> _mockTenantService;
        private readonly Mock<ILogger<TenantController>> _mockLogger;
        private readonly TenantController _tenantController;

        public TenantControllerTests()
        {
            _mockTenantService = new Mock<ITenantService>();
            _mockLogger = new Mock<ILogger<TenantController>>();
            _tenantController = new TenantController(_mockTenantService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateTenant_ReturnsCreatedAtActionResult_WhenTenantIsCreated()
        {
            // Arrange
            var request = new CreateTenantRequest { Name = "Test Tenant" };
            var tenant = new Tenant { Id = Guid.NewGuid(), Name = "Test Tenant", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _mockTenantService.Setup(s => s.CreateTenantAsync(request)).ReturnsAsync(tenant);

            // Act
            var result = await _tenantController.CreateTenant(request);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var tenantResponse = Assert.IsType<TenantResponse>(createdAtActionResult.Value);
            Assert.Equal(tenant.Id, tenantResponse.Id);
            _mockTenantService.Verify(s => s.CreateTenantAsync(request), Times.Once);
        }

        [Fact]
        public async Task GetTenantById_ReturnsOkResult_WhenTenantExists()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var tenant = new Tenant { Id = tenantId, Name = "Test Tenant", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _mockTenantService.Setup(s => s.GetTenantByIdAsync(tenantId)).ReturnsAsync(tenant);

            // Act
            var result = await _tenantController.GetTenantById(tenantId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var tenantResponse = Assert.IsType<TenantResponse>(okResult.Value);
            Assert.Equal(tenantId, tenantResponse.Id);
            _mockTenantService.Verify(s => s.GetTenantByIdAsync(tenantId), Times.Once);
        }

        [Fact]
        public async Task GetTenantById_ReturnsNotFound_WhenTenantDoesNotExist()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            _mockTenantService.Setup(s => s.GetTenantByIdAsync(tenantId)).ReturnsAsync((Tenant)null);

            // Act
            var result = await _tenantController.GetTenantById(tenantId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
            _mockTenantService.Verify(s => s.GetTenantByIdAsync(tenantId), Times.Once);
        }

        [Fact]
        public async Task GetAllTenants_ReturnsOkResult_WithListOfTenants()
        {
            // Arrange
            var tenants = new List<Tenant>
            {
                new Tenant { Id = Guid.NewGuid(), Name = "Tenant 1", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Tenant { Id = Guid.NewGuid(), Name = "Tenant 2", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };
            _mockTenantService.Setup(s => s.GetAllTenantsAsync()).ReturnsAsync(tenants);

            // Act
            var result = await _tenantController.GetAllTenants();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var tenantResponses = Assert.IsAssignableFrom<IEnumerable<TenantResponse>>(okResult.Value);
            Assert.Equal(tenants.Count, tenantResponses.Count());
            _mockTenantService.Verify(s => s.GetAllTenantsAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateTenant_ReturnsOkResult_WhenTenantIsUpdated()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var request = new UpdateTenantRequest { Name = "Updated Name" };
            var tenant = new Tenant { Id = tenantId, Name = "Updated Name", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _mockTenantService.Setup(s => s.UpdateTenantAsync(tenantId, request)).ReturnsAsync(tenant);

            // Act
            var result = await _tenantController.UpdateTenant(tenantId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var tenantResponse = Assert.IsType<TenantResponse>(okResult.Value);
            Assert.Equal(tenantId, tenantResponse.Id);
            Assert.Equal(request.Name, tenantResponse.Name);
            _mockTenantService.Verify(s => s.UpdateTenantAsync(tenantId, request), Times.Once);
        }

        [Fact]
        public async Task UpdateTenant_ReturnsNotFound_WhenTenantDoesNotExist()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var request = new UpdateTenantRequest { Name = "Updated Name" };
            _mockTenantService.Setup(s => s.UpdateTenantAsync(tenantId, request)).ReturnsAsync((Tenant)null);

            // Act
            var result = await _tenantController.UpdateTenant(tenantId, request);

            // Assert
            Assert.IsType<NotFoundResult>(result);
            _mockTenantService.Verify(s => s.UpdateTenantAsync(tenantId, request), Times.Once);
        }

        [Fact]
        public async Task DeleteTenant_ReturnsNoContent_WhenTenantIsDeleted()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            _mockTenantService.Setup(s => s.DeleteTenantAsync(tenantId)).ReturnsAsync(true);

            // Act
            var result = await _tenantController.DeleteTenant(tenantId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockTenantService.Verify(s => s.DeleteTenantAsync(tenantId), Times.Once);
        }

        [Fact]
        public async Task DeleteTenant_ReturnsNotFound_WhenTenantDoesNotExist()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            _mockTenantService.Setup(s => s.DeleteTenantAsync(tenantId)).ReturnsAsync(false);

            // Act
            var result = await _tenantController.DeleteTenant(tenantId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
            _mockTenantService.Verify(s => s.DeleteTenantAsync(tenantId), Times.Once);
        }
    }
}