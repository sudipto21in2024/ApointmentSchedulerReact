using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Data;
using Shared.Events;
using Shared.Models;
using System;
using System.Threading.Tasks;
using Xunit;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using BookingService.Consumers;
using System.Reflection;

namespace BookingService.Tests
{
    public class PaymentProcessedConsumerTests
    {
        [Fact]
        public void ValidateEvent_WithInvalidPaymentId_ThrowsValidationException()
        {
            // Arrange
            var paymentEvent = new PaymentProcessedEvent
            {
                PaymentId = Guid.Empty, // Invalid
                BookingId = Guid.NewGuid(),
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = Guid.NewGuid(),
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard",
                TransactionId = "txn_123456",
                PaymentGateway = "Stripe",
                ProcessedAt = DateTime.UtcNow
            };

            // Create a simple in-memory database context for testing
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase" + Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            var dbContext = new ApplicationDbContext(options, httpContextAccessorMock.Object);
            
            var loggerMock = new Mock<ILogger<PaymentProcessedConsumer>>();
            var consumer = new PaymentProcessedConsumer(
                loggerMock.Object,
                dbContext);

            // Use reflection to access the private ValidateEvent method
            var method = typeof(PaymentProcessedConsumer).GetMethod("ValidateEvent", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(method);
            
            // Act & Assert
            var ex = Assert.ThrowsAny<Exception>(() => method.Invoke(consumer, new object[] { paymentEvent }));
            Assert.IsType<TargetInvocationException>(ex);
            Assert.IsType<EventValidationException>(ex.InnerException);
        }

        [Fact]
        public void ValidateEvent_WithValidEvent_DoesNotThrowException()
        {
            // Arrange
            var paymentEvent = new PaymentProcessedEvent
            {
                PaymentId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                CustomerId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = Guid.NewGuid(),
                Amount = 100.00m,
                Currency = "USD",
                PaymentMethod = "CreditCard",
                TransactionId = "txn_123456",
                PaymentGateway = "Stripe",
                ProcessedAt = DateTime.UtcNow
            };

            // Create a simple in-memory database context for testing
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase" + Guid.NewGuid().ToString())
                .Options;
            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            var dbContext = new ApplicationDbContext(options, httpContextAccessorMock.Object);
            
            var loggerMock = new Mock<ILogger<PaymentProcessedConsumer>>();
            var consumer = new PaymentProcessedConsumer(
                loggerMock.Object,
                dbContext);

            // Use reflection to access the private ValidateEvent method
            var method = typeof(PaymentProcessedConsumer).GetMethod("ValidateEvent", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(method);
            
            // Act & Assert
            // This should not throw an exception for a valid event
            method.Invoke(consumer, new object[] { paymentEvent });
        }
    }
}