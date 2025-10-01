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
    public class PaymentValidatorRefundTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly PaymentValidator _paymentValidator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;

        public PaymentValidatorRefundTests()
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
        public async Task ValidateRefundPaymentRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);
            
            var paymentId = Guid.NewGuid();
            var bookingId = Guid.NewGuid();
            var customerId = Guid.NewGuid();
            var providerId = Guid.NewGuid();

            var payment = new Payment
            {
                Id = paymentId,
                TenantId = tenantId,
                PaymentStatus = "Completed",
                Amount = 100.00m,
                PaymentMethod = "CreditCard"
            };
            var booking = new Booking { Id = bookingId, TenantId = tenantId };
            var customer = new User { Id = customerId, TenantId = tenantId, Email = "customer@test.com", FirstName = "Test", LastName = "Customer", PasswordHash = "hash", PasswordSalt = "salt", UserType = Shared.Models.UserRole.Customer, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            var provider = new User { Id = providerId, TenantId = tenantId, Email = "provider@test.com", FirstName = "Test", LastName = "Provider", PasswordHash = "hash", PasswordSalt = "salt", UserType = Shared.Models.UserRole.Provider, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

            _context.Payments.Add(payment);
            _context.Bookings.Add(booking);
            _context.Users.Add(customer);
            _context.Users.Add(provider);
            await _context.SaveChangesAsync();

            var request = new RefundPaymentRequest
            {
                PaymentId = paymentId,
                BookingId = bookingId,
                CustomerId = customerId,
                ProviderId = providerId,
                TenantId = tenantId,
                RefundAmount = 50.00m,
                Currency = "USD",
                RefundReason = "Customer request"
            };

            // Act
            var result = await _paymentValidator.ValidateRefundPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateRefundPaymentRequestAsync_AlreadyRefunded_ReturnsInvalidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);
            
            var paymentId = Guid.NewGuid();

            var payment = new Payment
            {
                Id = paymentId,
                TenantId = tenantId,
                PaymentStatus = "Refunded",
                Amount = 100.00m,
                PaymentMethod = "CreditCard"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            var request = new RefundPaymentRequest
            {
                PaymentId = paymentId,
                BookingId = Guid.NewGuid(),
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                RefundAmount = 50.00m,
                Currency = "USD",
                RefundReason = "Customer request"
            };

            // Act
            var result = await _paymentValidator.ValidateRefundPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Payment has already been refunded", result.Errors);
        }

        [Fact]
        public async Task ValidateRefundPaymentRequestAsync_RefundAmountExceedsPaymentAmount_ReturnsInvalidResult()
        {
            // Arrange
            // Get the tenant ID from the HTTP context
            var tenantId = Guid.Parse(_mockHttpContextAccessor.Object.HttpContext.User.FindFirst("TenantId").Value);
            
            var paymentId = Guid.NewGuid();

            var payment = new Payment
            {
                Id = paymentId,
                TenantId = tenantId,
                PaymentStatus = "Completed",
                Amount = 100.00m,
                PaymentMethod = "CreditCard"
            };

            // Add the payment to the context and save
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Verify the payment was saved
            var savedPayment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == paymentId);
            Assert.NotNull(savedPayment);
            Assert.Equal(tenantId, savedPayment.TenantId);

            var request = new RefundPaymentRequest
            {
                PaymentId = paymentId,
                BookingId = Guid.NewGuid(),
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                RefundAmount = 150.00m, // Exceeds payment amount
                Currency = "USD",
                RefundReason = "Customer request"
            };

            // Act
            var result = await _paymentValidator.ValidateRefundPaymentRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Refund amount cannot be greater than the original payment amount", result.Errors);
        }
    }
}