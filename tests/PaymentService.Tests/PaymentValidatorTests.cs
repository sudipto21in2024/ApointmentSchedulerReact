using System.Threading;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Moq;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using PaymentService.Validators;
using Microsoft.EntityFrameworkCore.InMemory;
using System.Collections.Generic; // Added
using System.Linq; // Added

namespace PaymentService.Tests
{
    public class PaymentValidatorTests
    {
        private readonly Mock<ApplicationDbContext> _mockContext;
        private readonly PaymentValidator _paymentValidator;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;

        public PaymentValidatorTests()
        {
            // Create a mock IHttpContextAccessor
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create DbContextOptions
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with mocked IHttpContextAccessor
            var context = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);

            _mockContext = new Mock<ApplicationDbContext>(options, _mockHttpContextAccessor.Object);
            
            _paymentValidator = new PaymentValidator(_mockContext.Object);
        }

        // Add any additional tests here if needed
    }
}