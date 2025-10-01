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
    public class AnalyticsServiceTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly AnalyticsService _analyticsService;
        private readonly Mock<ILogger<AnalyticsService>> _loggerMock;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public AnalyticsServiceTests()
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
            _loggerMock = new Mock<ILogger<AnalyticsService>>();
            _analyticsService = new AnalyticsService(_dbContext);
        }

        [Fact]
        public async Task GetBookingDataAsync_WithValidData_ReturnsCorrectAnalytics()
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
            
            var filter = new AnalyticsFilterDto
            {
                TimePeriod = "day"
            };
            
            // Act
            var result = await _analyticsService.GetBookingDataAsync(providerId, tenantId, filter);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.BookingTrends);
            Assert.NotNull(result.BookingsByService);
            Assert.NotNull(result.BookingsByStatus);
            Assert.NotNull(result.Statistics);
            Assert.NotEmpty(result.BookingTrends);
            Assert.Single(result.BookingsByService);
            Assert.Single(result.BookingsByStatus);
        }

        [Fact]
        public async Task GetRevenueDataAsync_WithValidData_ReturnsCorrectAnalytics()
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
            
            var filter = new AnalyticsFilterDto
            {
                TimePeriod = "day"
            };
            
            // Act
            var result = await _analyticsService.GetRevenueDataAsync(providerId, tenantId, filter);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.RevenueTrends);
            Assert.NotNull(result.RevenueByService);
            Assert.NotNull(result.Statistics);
            Assert.NotEmpty(result.RevenueTrends);
            Assert.Single(result.RevenueByService);
        }

        [Fact]
        public async Task GetCustomerDataAsync_WithValidData_ReturnsCorrectInsights()
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
            
            var review = new Review
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                CustomerId = customerId,
                Rating = 5,
                Title = "Great service",
                Comment = "Excellent experience",
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow
            };
            
            // Add test data to database
            _dbContext.Users.AddRange(user, customer);
            _dbContext.Services.Add(service);
            _dbContext.Slots.Add(slot);
            _dbContext.Bookings.Add(booking);
            _dbContext.Payments.Add(payment);
            _dbContext.Reviews.Add(review);
            await _dbContext.SaveChangesAsync();
            
            var filter = new AnalyticsFilterDto
            {
                TimePeriod = "day"
            };
            
            // Act
            var result = await _analyticsService.GetCustomerDataAsync(providerId, tenantId, filter);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.CustomerBookingHistory);
            Assert.NotNull(result.CustomerFeedback);
            Assert.NotNull(result.Statistics);
            Assert.NotEmpty(result.CustomerBookingHistory);
            Assert.NotEmpty(result.CustomerFeedback);
        }

        [Fact]
        public async Task GetBookingDataAsync_WithInvalidFilter_ThrowsArgumentException()
        {
            // Arrange
            var providerId = Guid.NewGuid();
            var tenantId = _testTenantId;
            
            var filter = new AnalyticsFilterDto
            {
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(-1), // Invalid: end date before start date
                TimePeriod = "day"
            };
            
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _analyticsService.GetBookingDataAsync(providerId, tenantId, filter));
        }
    }
}