using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Moq;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using PaymentService.Validators;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace PaymentService.Tests
{
    public class PaymentValidatorProcessPaymentTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly PaymentValidator _paymentValidator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;

        public PaymentValidatorProcessPaymentTests()
        {
            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            // Create a claims identity with a tenant ID claim
            var claims = new List<Claim>
            {
                new Claim("TenantId", Guid.NewGuid().ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create DbContextOptions
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with mocked IHttpContextAccessor
            _context = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);
            
            _paymentValidator = new PaymentValidator(_context);
        }

        public void Dispose()
        {
            // Cleanup resources when the test class is disposed
        }

        [Fact]
        public async Task ValidateProcessPaymentRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);
            
            var bookingId = Guid.NewGuid();
            var customerId = Guid.NewGuid();
            var providerId = Guid.NewGuid();

            var booking = new Booking { Id = bookingId, TenantId = tenantId };
            var customer = new User { Id = customerId, TenantId = tenantId, Email = "customer@test.com", FirstName = "Test", LastName = "Customer", PasswordHash = "hash", PasswordSalt = "salt", UserType = Shared.Models.UserRole.Customer, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var provider = new User { Id = providerId, TenantId = tenantId, Email = "provider@test.com", FirstName = "Test", LastName = "Provider", PasswordHash = "hash", PasswordSalt = "salt", UserType = Shared.Models.UserRole.Provider, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

            _context.Bookings.Add(booking);
            _context.Users.Add(customer);
            _context.Users.Add(provider);
            await _context.SaveChangesAsync();

            // Verify the data was saved
            var savedBooking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);
            var savedCustomer = await _context.Users.FirstOrDefaultAsync(u => u.Id == customerId);
            var savedProvider = await _context.Users.FirstOrDefaultAsync(u => u.Id == providerId);
            
            Assert.NotNull(savedBooking);
            Assert.NotNull(savedCustomer);
            Assert.NotNull(savedProvider);
            Assert.Equal(tenantId, savedBooking.TenantId);
            Assert.Equal(tenantId, savedCustomer.TenantId);
            Assert.Equal(tenantId, savedProvider.TenantId);

            var request = new ProcessPaymentRequest
            {
                BookingId = bookingId,
                CustomerId = customerId,
                ProviderId = providerId,
                TenantId = tenantId,
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard"
            };

            // Act
            var result = await _paymentValidator.ValidateProcessPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateProcessPaymentRequestAsync_MissingBookingId_ReturnsInvalidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);

            var request = new ProcessPaymentRequest
            {
                BookingId = Guid.Empty, // Missing
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard"
            };

            // Act
            var result = await _paymentValidator.ValidateProcessPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Booking ID is required", result.Errors);
        }

        [Fact]
        public async Task ValidateProcessPaymentRequestAsync_InvalidBooking_ReturnsInvalidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);
            var bookingId = Guid.NewGuid();

            // Don't add the booking to the context to simulate invalid booking

            var request = new ProcessPaymentRequest
            {
                BookingId = bookingId,
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard"
            };

            // Act
            var result = await _paymentValidator.ValidateProcessPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid booking ID or booking does not belong to the tenant", result.Errors);
        }
    }
}