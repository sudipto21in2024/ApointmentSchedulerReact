using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using SlotManagementService.Validators;
using Shared.Data;
using Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using Shared.DTOs;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SlotManagementService.Tests
{
    public class SlotValidatorTests
    {
        private readonly Mock<ILogger<SlotValidator>> _loggerMock;
        private readonly SlotValidator _validator;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Guid _testTenantId;

        public SlotValidatorTests()
        {
            // Create a test tenant ID that will be used consistently
            _testTenantId = Guid.NewGuid();

            // Create a mock IHttpContextAccessor with a tenant ID claim
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            
            // Create a claims identity with a tenant ID claim
            var claims = new List<Claim>
            {
                new Claim("TenantId", _testTenantId.ToString())
            };
            var claimsIdentity = new ClaimsIdentity(claims);
            mockHttpContext.User = new ClaimsPrincipal(claimsIdentity);
            
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);

            // Create a simple in-memory database context for testing
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase_SlotValidator")
                .Options;
            _dbContext = new ApplicationDbContext(options, _mockHttpContextAccessor.Object);
            _loggerMock = new Mock<ILogger<SlotValidator>>();
            _validator = new SlotValidator(_dbContext);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_MissingServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateSlotRequest
            {
                ServiceId = Guid.Empty, // Missing service ID
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service ID is required", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_InvalidServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateSlotRequest
            {
                ServiceId = Guid.NewGuid(), // Non-existent service
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid service ID", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_StartAfterEnd_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(2), // Start after end
                EndDateTime = DateTime.UtcNow.AddHours(1),   // End before start
                MaxBookings = 5,
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Start date/time must be before end date/time", result.Errors);
        }

        [Fact]
        public async Task ValidateCreateSlotRequestAsync_ZeroMaxBookings_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateSlotRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 0, // Zero max bookings
                IsAvailable = true,
                IsRecurring = false
            };

            // Act
            var result = await _validator.ValidateCreateSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Max bookings must be greater than 0", result.Errors);
        }

        [Fact]
        public async Task ValidateUpdateSlotRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(3),
                EndDateTime = DateTime.UtcNow.AddHours(4),
                MaxBookings = 10,
                IsAvailable = false
            };

            // Act
            var result = _validator.ValidateUpdateSlotRequest(request);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateUpdateSlotRequestAsync_StartAfterEnd_ReturnsInvalidResult()
        {
            // Arrange
            var request = new UpdateSlotRequest
            {
                StartDateTime = DateTime.UtcNow.AddHours(4), // Start after end
                EndDateTime = DateTime.UtcNow.AddHours(3)    // End before start
            };

            // Act
            var result = _validator.ValidateUpdateSlotRequest(request);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Start date/time must be before end date/time", result.Errors);
        }

        [Fact]
        public async Task ValidateUpdateSlotRequestAsync_ZeroMaxBookings_ReturnsInvalidResult()
        {
            // Arrange
            var request = new UpdateSlotRequest
            {
                MaxBookings = 0 // Zero max bookings
            };

            // Act
            var result = _validator.ValidateUpdateSlotRequest(request);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Max bookings must be greater than 0", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_ValidRequest_ReturnsValidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_MissingServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = Guid.Empty, // Missing service ID
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Service ID is required", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_InvalidServiceId_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = Guid.NewGuid(), // Non-existent service
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid service ID", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_StartAfterEnd_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(2), // Start after end
                EndDateTime = DateTime.UtcNow.AddHours(1),   // End before start
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Start date/time must be before end date/time", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_ZeroMaxBookings_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 0, // Zero max bookings
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Max bookings must be greater than 0", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_ZeroInterval_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 0, // Zero interval
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Interval must be greater than 0", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_ZeroOccurrences_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 0, // Zero occurrences
                EndDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Occurrences must be greater than 0", result.Errors);
        }

        [Fact]
        public async Task ValidateRecurringSlotRequestAsync_EndBeforeStart_ReturnsInvalidResult()
        {
            // Arrange
            var tenantId = _testTenantId;
            var serviceId = Guid.NewGuid();
            
            // Add a service to the database
            var service = new Service
            {
                Id = serviceId,
                Name = "Test Service",
                Description = "Test Description",
                CategoryId = Guid.NewGuid(),
                ProviderId = Guid.NewGuid(),
                TenantId = tenantId,
                Duration = 60,
                Price = 100.00m,
                Currency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Services.Add(service);
            await _dbContext.SaveChangesAsync();

            var request = new CreateRecurringSlotsRequest
            {
                ServiceId = serviceId,
                StartDateTime = DateTime.UtcNow.AddHours(1),
                EndDateTime = DateTime.UtcNow.AddHours(2),
                MaxBookings = 5,
                Pattern = RecurrencePattern.Daily,
                Interval = 1,
                Occurrences = 10,
                EndDate = DateTime.UtcNow.AddHours(-1) // End date before start date
            };

            // Act
            var result = await _validator.ValidateRecurringSlotRequestAsync(request, tenantId);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("End date must be after start date", result.Errors);
        }
    }
}