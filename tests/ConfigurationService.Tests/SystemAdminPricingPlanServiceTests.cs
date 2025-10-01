using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConfigurationService.Services;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace ConfigurationService.Tests
{
    public class SystemAdminPricingPlanServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<SystemAdminPricingPlanService>> _loggerMock;
        private readonly SystemAdminPricingPlanService _service;

        public SystemAdminPricingPlanServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _context = new ApplicationDbContext(options, httpContextAccessorMock.Object);
            _loggerMock = new Mock<ILogger<SystemAdminPricingPlanService>>();
            _service = new SystemAdminPricingPlanService(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CreatePricingPlanAsync_ValidRequest_CreatesPricingPlan()
        {
            // Arrange
            var request = new CreatePricingPlanRequest
            {
                Name = "Test Plan",
                Description = "Test Description",
                Price = 29.99m,
                Currency = "USD",
                Interval = "monthly",
                Features = new List<string> { "Feature 1", "Feature 2" },
                MaxUsers = 10,
                MaxAppointments = 100
            };

            // Act
            var result = await _service.CreatePricingPlanAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Description, result.Description);
            Assert.Equal(request.Price, result.Price);
            Assert.Equal(PricingPlanStatus.Active, result.Status);

            var planInDb = await _context.PricingPlans.FindAsync(result.Id);
            Assert.NotNull(planInDb);
            Assert.Equal(PricingPlanStatus.Active, planInDb.Status);
        }

        [Fact]
        public async Task CreatePricingPlanAsync_DuplicateName_ThrowsException()
        {
            // Arrange
            var plan = new PricingPlan
            {
                Id = Guid.NewGuid(),
                Name = "Existing Plan",
                Description = "Existing Description",
                Price = 19.99m,
                Currency = "USD",
                Interval = "monthly",
                Status = PricingPlanStatus.Active,
                CreatedDate = DateTime.UtcNow
            };
            _context.PricingPlans.Add(plan);
            await _context.SaveChangesAsync();

            var request = new CreatePricingPlanRequest
            {
                Name = "Existing Plan", // duplicate
                Description = "New Description",
                Price = 29.99m,
                Currency = "USD",
                Interval = "monthly"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreatePricingPlanAsync(request));
        }

        [Fact]
        public async Task GetPricingPlanByIdAsync_ExistingPlan_ReturnsPlan()
        {
            // Arrange
            var plan = new PricingPlan
            {
                Id = Guid.NewGuid(),
                Name = "Test Plan",
                Description = "Test Description",
                Price = 29.99m,
                Currency = "USD",
                Interval = "monthly",
                Status = PricingPlanStatus.Active,
                CreatedDate = DateTime.UtcNow
            };
            _context.PricingPlans.Add(plan);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetPricingPlanByIdAsync(plan.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(plan.Id, result.Id);
            Assert.Equal(plan.Name, result.Name);
        }

        [Fact]
        public async Task GetPricingPlanByIdAsync_NonExistingPlan_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetPricingPlanByIdAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task UpdatePricingPlanAsync_ValidRequest_UpdatesPlan()
        {
            // Arrange
            var plan = new PricingPlan
            {
                Id = Guid.NewGuid(),
                Name = "Original Plan",
                Description = "Original Description",
                Price = 19.99m,
                Currency = "USD",
                Interval = "monthly",
                Status = PricingPlanStatus.Active,
                CreatedDate = DateTime.UtcNow
            };
            _context.PricingPlans.Add(plan);
            await _context.SaveChangesAsync();

            var request = new UpdatePricingPlanRequest
            {
                Name = "Updated Plan",
                Description = "Updated Description",
                Price = 39.99m,
                MaxUsers = 20
            };

            // Act
            var result = await _service.UpdatePricingPlanAsync(plan.Id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Plan", result.Name);
            Assert.Equal("Updated Description", result.Description);
            Assert.Equal(39.99m, result.Price);
            Assert.Equal(20, result.MaxUsers);

            var updatedPlan = await _context.PricingPlans.FindAsync(plan.Id);
            Assert.Equal("Updated Plan", updatedPlan.Name);
            Assert.NotNull(updatedPlan.UpdatedDate);
        }

        [Fact]
        public async Task UpdatePricingPlanStatusAsync_ValidRequest_UpdatesStatus()
        {
            // Arrange
            var plan = new PricingPlan
            {
                Id = Guid.NewGuid(),
                Name = "Test Plan",
                Description = "Test Description",
                Price = 29.99m,
                Currency = "USD",
                Interval = "monthly",
                Status = PricingPlanStatus.Active,
                CreatedDate = DateTime.UtcNow
            };
            _context.PricingPlans.Add(plan);
            await _context.SaveChangesAsync();

            var request = new UpdatePricingPlanStatusRequest
            {
                Status = PricingPlanStatus.Archived
            };

            // Act
            var result = await _service.UpdatePricingPlanStatusAsync(plan.Id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(PricingPlanStatus.Archived, result.Status);

            var updatedPlan = await _context.PricingPlans.FindAsync(plan.Id);
            Assert.Equal(PricingPlanStatus.Archived, updatedPlan.Status);
        }

        [Fact]
        public async Task GetAllPricingPlansAsync_ReturnsPaginatedResults()
        {
            // Arrange
            for (int i = 1; i <= 5; i++)
            {
                var plan = new PricingPlan
                {
                    Id = Guid.NewGuid(),
                    Name = $"Plan {i}",
                    Description = $"Description {i}",
                    Price = 10.00m * i,
                    Currency = "USD",
                    Interval = "monthly",
                    Status = PricingPlanStatus.Active,
                    CreatedDate = DateTime.UtcNow
                };
                _context.PricingPlans.Add(plan);
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllPricingPlansAsync(page: 1, pageSize: 3);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.PricingPlans.Count());
            Assert.Equal(5, result.TotalCount);
            Assert.Equal(1, result.Page);
            Assert.Equal(3, result.PageSize);
            Assert.Equal(2, result.TotalPages);
        }
    }
}