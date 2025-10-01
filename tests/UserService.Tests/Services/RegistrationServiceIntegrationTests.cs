using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Models;
using Shared.DTOs;
using UserService.DTO;
using UserService.Services;
using Xunit;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;
using ConfigurationService.Services;
using PaymentService.Services;

namespace UserService.Tests.Services
{
    public class RegistrationServiceIntegrationTests
    {
        [Fact]
        public async Task RegistrationService_Should_Be_Created_Successfully()
        {
            // Arrange
            var mockTenantService = new Mock<ITenantService>();
            var mockUserService = new Mock<Shared.Contracts.IUserService>();
            var mockSubscriptionService = new Mock<ISubscriptionService>();
            var mockPaymentService = new Mock<IPaymentService>();
            var mockAuthenticationService = new Mock<IAuthenticationService>();
            var mockLogger = new Mock<ILogger<RegistrationService>>();
            
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;
                
            var mockHttpContextAccessor = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            using var dbContext = new ApplicationDbContext(options, mockHttpContextAccessor.Object);

            // Act
            var registrationService = new RegistrationService(
                mockTenantService.Object,
                mockUserService.Object,
                mockSubscriptionService.Object,
                mockPaymentService.Object,
                mockAuthenticationService.Object,
                dbContext,
                mockLogger.Object
            );

            // Assert
            Assert.NotNull(registrationService);
        }
    }
}