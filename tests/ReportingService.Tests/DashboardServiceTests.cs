using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using ReportingService.Services;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ReportingService.Tests
{
    public class DashboardServiceTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly DashboardService _dashboardService;
        private readonly Mock<ILogger<DashboardService>> _loggerMock;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public DashboardServiceTests()
        {
            _testTenantId = Guid.NewGuid();

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            var claims = new List<Claim>
            {
                new Claim("TenantId", _testTenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create a new in-memory database for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase" + Guid.NewGuid().ToString())
                .Options;
            
            _dbContext = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);
            _loggerMock = new Mock<ILogger<DashboardService>>();
            _dashboardService = new DashboardService(_dbContext);
        }

        [Fact]
        public async Task GetOverviewDataAsync_WithValidData_ReturnsCorrectOverview()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var tenantId = _testTenantId;
            var customerId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();
            
            // Create test data
            var user = new User
            {
                Id = providerId,
                Email = "provider@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Provider",
                TenantId = tenantId
            };
            
            var customer = new User
            {
                Id = customerId,
                Email = "customer@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Customer",
                TenantId = tenantId
            };
            
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test service description",
                ProviderId = providerId,
                TenantId = tenantId,
                Price = 100.00m,
                Duration = 60
            };
            
            var slot = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddDays(1),
                EndDateTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                TenantId = tenantId
            };
            
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                ServiceId = serviceId,
                SlotId = slot.Id,
                TenantId = tenantId,
                Status = "Confirmed",
                BookingDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard",
                PaymentStatus = "Completed",
                PaidAt = DateTime.UtcNow,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow
            };
            
            // Add test data to database
            _dbContext.Users.AddRange(user, customer);
            _dbContext.Services.Add(service);
            _dbContext.Slots.Add(slot);
            _dbContext.Bookings.Add(booking);
            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();
            
            var filter = new DashboardFilterDto
            {
                Limit = 10
            };
            
            // Act
            var result = await _dashboardService.GetOverviewDataAsync(providerId, tenantId, filter);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TotalBookings);
            Assert.Equal(100.00m, result.TotalRevenue);
            Assert.Equal(1, result.TotalCustomers);
            Assert.Single(result.RecentBookings);
            Assert.Single(result.UpcomingBookings);
        }

        [Fact]
        public async Task GetOverviewDataAsync_WithInvalidFilter_ThrowsArgumentException()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var tenantId = _testTenantId;
            
            var filter = new DashboardFilterDto
            {
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(-1), // Invalid: end date before start date
                Limit = 10
            };
            
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _dashboardService.GetOverviewDataAsync(providerId, tenantId, filter));
        }

        [Fact]
        public async Task GetSystemHealthAsync_ReturnsSystemHealthData()
        {
            // Arrange
            var tenantId = _testTenantId;
            
            // Act
            var result = await _dashboardService.GetSystemHealthAsync(tenantId);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Performance);
            Assert.NotNull(result.ErrorMetrics);
            Assert.NotNull(result.ServiceStatuses);
            Assert.NotEmpty(result.ServiceStatuses);
        }
    }
}