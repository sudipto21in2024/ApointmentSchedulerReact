using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using ServiceManagementService.Services;
using ServiceManagementService.Validators;
using Shared.Data;
using Shared.Models;
using Shared.Events;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Shared.Models.Enums;
using Shared.DTOs;

namespace ServiceManagementService.Tests
{
    public class ServiceApprovalRejectionTests : IDisposable
    {
        private readonly Mock<ILogger<ServiceService>> _loggerMock;
        private readonly Mock<IPublishEndpoint> _publishEndpointMock;
        private readonly Mock<IServiceValidator> _validatorMock;
        private ServiceService _serviceService; // Changed to non-readonly as it will be initialized per test
        private ApplicationDbContext _dbContext; // Changed to non-readonly as it will be initialized per test
        private readonly Guid _testTenantId;
        private readonly Guid _testAdminId;
        private readonly Guid _testProviderId;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;

        public ServiceApprovalRejectionTests()
        {
            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();

            // Create a test tenant ID that will be used consistently
            _testTenantId = Guid.NewGuid();

            // Create a claims identity with a tenant ID claim
            var claims = new List<Claim>
            {
                new Claim("TenantId", _testTenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);

            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create DbContextOptions
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with mocked IHttpContextAccessor
            _dbContext = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);


            _loggerMock = new Mock<ILogger<ServiceService>>();
            _publishEndpointMock = new Mock<IPublishEndpoint>();
            _validatorMock = new Mock<IServiceValidator>();

           
            _testAdminId = Guid.NewGuid();
            _testProviderId = Guid.NewGuid();

            // var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            //     .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            //     .Options;
            // _dbContext = new ApplicationDbContext(options, new HttpContextAccessor()); // Pass a real HttpContextAccessor or mock if needed for tenant resolution

            // Seed initial data
            SeedData().Wait();

            _serviceService = new ServiceService(_dbContext, _validatorMock.Object, _publishEndpointMock.Object);
        }

        private async Task SeedData()
        {
            _dbContext.Users.Add(new User
            {
                Id = _testAdminId,
                Email = "admin@test.com",
                FirstName = "Admin",
                LastName = "User",
                PasswordHash = "hashed_password",
                PasswordSalt = "salt",
                UserType = UserRole.Admin,
                TenantId = _testTenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            _dbContext.Users.Add(new User
            {
                Id = _testProviderId,
                Email = "provider@test.com",
                FirstName = "Provider",
                LastName = "User",
                PasswordHash = "hashed_password",
                PasswordSalt = "salt",
                UserType = UserRole.Provider,
                TenantId = _testTenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _dbContext.SaveChangesAsync();
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task ApproveServiceAsync_PendingService_ApprovesSuccessfully()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false, // Simulate pending/inactive
                Status = ServiceStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _serviceService.ApproveServiceAsync(service.Id, _testAdminId, _testTenantId);

            // Assert
            Assert.True(result);
            var approvedService = await _dbContext.Services.FindAsync(service.Id);
            Assert.NotNull(approvedService);
            Assert.True(approvedService.IsActive);
            Assert.Equal(ServiceStatus.Approved, approvedService.Status);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceApprovedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task ApproveServiceAsync_AlreadyApprovedService_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = true,
                Status = ServiceStatus.Approved,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _dbContext.Services.AddAsync(service);
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _serviceService.ApproveServiceAsync(service.Id, _testAdminId, _testTenantId));
            Assert.Contains("Service is already Approved and cannot be approved.", exception.Message);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceApprovedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task ApproveServiceAsync_AlreadyRejectedService_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false,
                Status = ServiceStatus.Rejected,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _serviceService.ApproveServiceAsync(service.Id, _testAdminId, _testTenantId));
            Assert.Contains("Service is already Rejected and cannot be approved.", exception.Message);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceApprovedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task ApproveServiceAsync_NonExistentService_ThrowsKeyNotFoundException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _serviceService.ApproveServiceAsync(Guid.NewGuid(), _testAdminId, _testTenantId));
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceApprovedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task ApproveServiceAsync_UnauthorizedUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false,
                Status = ServiceStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var nonAdminUserId = Guid.NewGuid();
            _dbContext.Users.Add(new User
            {
                Id = nonAdminUserId,
                Email = "nonadmin@test.com",
                UserType = UserRole.Customer,
                TenantId = _testTenantId,
                 FirstName ="test",
                LastName ="test",
                PasswordHash = "hashed_password",
                PasswordSalt = "salt",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _serviceService.ApproveServiceAsync(service.Id, nonAdminUserId, _testTenantId));
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceApprovedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task RejectServiceAsync_PendingService_RejectsSuccessfully()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false, // Simulate pending/inactive
                Status = ServiceStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var rejectionReason = "Does not meet quality standards.";

            // Act
            var result = await _serviceService.RejectServiceAsync(service.Id, _testAdminId, _testTenantId, rejectionReason);

            // Assert
            Assert.True(result);
            var rejectedService = await _dbContext.Services.FindAsync(service.Id);
            Assert.NotNull(rejectedService);
            Assert.False(rejectedService.IsActive);
            Assert.Equal(ServiceStatus.Rejected, rejectedService.Status);
            Assert.Equal(rejectionReason, rejectedService.RejectionReason);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceRejectedEvent>(), default), Times.Once);
        }

        [Fact]
        public async Task RejectServiceAsync_AlreadyApprovedService_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = true,
                Status = ServiceStatus.Approved,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _serviceService.RejectServiceAsync(service.Id, _testAdminId, _testTenantId, "Reason"));
            Assert.Contains("Service is already Approved and cannot be rejected.", exception.Message);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceRejectedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task RejectServiceAsync_AlreadyRejectedService_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false,
                Status = ServiceStatus.Rejected,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _serviceService.RejectServiceAsync(service.Id, _testAdminId, _testTenantId, "Reason"));
            Assert.Contains("Service is already Rejected and cannot be rejected.", exception.Message);
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceRejectedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task RejectServiceAsync_NonExistentService_ThrowsKeyNotFoundException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _serviceService.RejectServiceAsync(Guid.NewGuid(), _testAdminId, _testTenantId, "Reason"));
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceRejectedEvent>(), default), Times.Never);
        }

        [Fact]
        public async Task RejectServiceAsync_UnauthorizedUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = _testProviderId,
                TenantId = _testTenantId,
                Duration = 60,
                Price = 50.00m,
                Currency = "USD",
                IsActive = false,
                Status = ServiceStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var nonAdminUserId = Guid.NewGuid();
            _dbContext.Users.Add(new User
            {
                Id = nonAdminUserId,
                Email = "nonadmin@test.com",
                UserType = UserRole.Customer,
                TenantId = _testTenantId,
                FirstName ="test",
                LastName ="test",
                PasswordHash = "hashed_password",
                PasswordSalt = "salt",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _dbContext.SaveChangesAsync();

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _serviceService.RejectServiceAsync(service.Id, nonAdminUserId, _testTenantId, "Reason"));
            _publishEndpointMock.Verify(p => p.Publish(It.IsAny<ServiceRejectedEvent>(), default), Times.Never);
        }
    }
}