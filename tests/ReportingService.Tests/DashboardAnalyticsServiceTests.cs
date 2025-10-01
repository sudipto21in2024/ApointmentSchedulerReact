using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using ReportingService.Services;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Xunit;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ReportingService.Tests
{
    public class DashboardAnalyticsServiceTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly DashboardAnalyticsService _service;
        private readonly Mock<ILogger<DashboardAnalyticsService>> _loggerMock;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public DashboardAnalyticsServiceTests()
        {
            _testTenantId = Guid.NewGuid();

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            // Claims will be set up in individual test methods

            // Create a new in-memory database for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase" + Guid.NewGuid().ToString())
                .Options;

            _dbContext = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);

            _loggerMock = new Mock<ILogger<DashboardAnalyticsService>>();
            _service = new DashboardAnalyticsService(_dbContext);
        }

        private void SetupTenantClaims(Guid tenantId)
        {
            var mockHttpContext = new DefaultHttpContext();
            var claims = new List<Claim>
            {
                new Claim("TenantId", tenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);
        }

        private void SetupSystemAdminClaims()
        {
            var mockHttpContext = new DefaultHttpContext();
            var claims = new List<Claim>
            {
                new Claim("TenantId", ApplicationDbContext.AdminTenantId.ToString()),
                new Claim("IsSystemAdmin", "true")
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);
        }


        [Fact]
        public async Task GetTenantDashboardOverviewAsync_ReturnsCorrectData()
        {
            // Arrange
            var tenantId = _testTenantId;
            SetupTenantClaims(tenantId);

            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;

            // Create test data
            var category = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = "Test Category",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                TenantId = tenantId
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "staff@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Staff",
                TenantId = tenantId
            };

            var customer = new User
            {
                Id = Guid.NewGuid(),
                Email = "customer@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Customer",
                TenantId = tenantId
            };

            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Test service description",
                CategoryId = category.Id,
                ProviderId = user.Id,
                TenantId = tenantId,
                Price = 100.00m,
                Duration = 60,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var slot = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = service.Id,
                TenantId = tenantId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                IsAvailable = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                ServiceId = service.Id,
                SlotId = slot.Id,
                TenantId = tenantId,
                Status = "Confirmed",
                BookingDate = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                Amount = 100.00m,
                PaymentMethod = "CreditCard",
                PaymentStatus = "Completed",
                PaidAt = DateTime.UtcNow,
                TenantId = tenantId
            };

            // Add test data to database
            _dbContext.ServiceCategories.Add(category);
            _dbContext.Users.Add(user);
            _dbContext.Users.Add(customer);
            _dbContext.Services.Add(service);
            _dbContext.Slots.Add(slot);
            _dbContext.Bookings.Add(booking);
            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _service.GetTenantDashboardOverviewAsync(tenantId, startDate, endDate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TotalBookings);
            Assert.Equal(100, result.TotalRevenue);
           // Assert.Equal(1, result.ActiveStaff);
            Assert.Equal(1, result.TotalServices);
        }

        [Fact]
        public async Task GetSystemDashboardOverviewAsync_ReturnsCorrectData()
        {
            // Arrange - system admin claims bypass tenant filters
            SetupSystemAdminClaims();

            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;

            var tenantId = Guid.NewGuid();
            var tenant = new Tenant
            {
                Id = tenantId,
                Name = "Test Tenant",
                Subdomain = "testtenant",
                Status = TenantStatus.Active,
                IsActive = true,
                ContactEmail = "admin@testtenant.com",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            // Create test data
            var category = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = "Test Category",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                 TenantId = tenantId
            };



            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "staff@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Staff",
                TenantId = tenantId
            };

            var customer = new User
            {
                Id = Guid.NewGuid(),
                Email = "customer@test.com",
                PasswordHash = "hash",
                PasswordSalt = "salt",
                FirstName = "Test",
                LastName = "Customer",
                TenantId = tenantId
            };

            var service = new Service
            {
                Id = Guid.NewGuid(),
                Name = "Test Service",
                Description = "Test service description",
                CategoryId = category.Id,
                ProviderId = user.Id,
                TenantId = tenantId,
                Price = 100.00m,
                Duration = 60,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var slot = new Slot
            {
                Id = Guid.NewGuid(),
                ServiceId = service.Id,
                TenantId = tenantId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                IsAvailable = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                CustomerId = customer.Id,
                ServiceId = service.Id,
                SlotId = slot.Id,
                TenantId = tenantId,
                Status = "Confirmed",
                BookingDate = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                Amount = 200.00m,
                PaymentMethod = "CreditCard",
                PaymentStatus = "Completed",
                PaidAt = DateTime.UtcNow,
                TenantId = tenantId
            };

            // Add test data to database (filters automatically bypassed for system admin)
            _dbContext.ServiceCategories.Add(category);
            _dbContext.Tenants.Add(tenant);
            _dbContext.Users.Add(user);
            _dbContext.Users.Add(customer);
            _dbContext.Services.Add(service);
            _dbContext.Slots.Add(slot);
            _dbContext.Bookings.Add(booking);
            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _service.GetSystemDashboardOverviewAsync(startDate, endDate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TotalTenants);
            Assert.Equal(2, result.TotalUsers); // staff + customer
            Assert.Equal(1, result.TotalBookings);
            Assert.Equal(200, result.TotalRevenue);
            Assert.Equal(1, result.ActiveServices);
        }
    }
}