using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ConfigurationService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using Moq;
using PaymentService.Services;
using Shared.Contracts;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using UserService.DTO;
using UserService.Services;
using Xunit;

namespace UserService.Tests.Services
{
    public class RegistrationServiceTests : IDisposable
    {
        private RegistrationService _registrationService;
        private readonly Mock<ITenantService> _mockTenantService;
        private readonly Mock<Shared.Contracts.IUserService> _mockUserService;
        private readonly Mock<ISubscriptionService> _mockSubscriptionService;
        private readonly Mock<IPaymentService> _mockPaymentService;
        private readonly Mock<IAuthenticationService> _mockAuthenticationService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<ILogger<RegistrationService>> _mockLogger;

        public RegistrationServiceTests()
        {
            _mockTenantService = new Mock<ITenantService>();
            _mockUserService = new Mock<Shared.Contracts.IUserService>();
            _mockSubscriptionService = new Mock<ISubscriptionService>();
            _mockPaymentService = new Mock<IPaymentService>();
            _mockAuthenticationService = new Mock<IAuthenticationService>();
            _mockLogger = new Mock<ILogger<RegistrationService>>();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            _dbContext = new ApplicationDbContext(options, mockHttpContextAccessor.Object);
            _dbContext.Database.EnsureDeleted();
            _dbContext.Database.EnsureCreated();

            _registrationService = new RegistrationService(
                _mockTenantService.Object,
                _mockUserService.Object,
                _mockSubscriptionService.Object,
                _mockPaymentService.Object,
                _mockAuthenticationService.Object,
                _dbContext,
                _mockLogger.Object
            );
        }

        private void SetupTenantClaims(Guid tenantId, Mock<IHttpContextAccessor> mockHttpContextAccessor)
        {
            var mockHttpContext = new DefaultHttpContext();
            var claims = new System.Collections.Generic.List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim("TenantId", tenantId.ToString())
            };
            var claimsIdentity = new System.Security.Claims.ClaimsIdentity(claims);
            mockHttpContext.User = new System.Security.Claims.ClaimsPrincipal(claimsIdentity);
            mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(mockHttpContext);
        }

        [Fact]
        public async Task RegisterProviderAsync_ShouldReturnSuccess_WhenAllOperationsSucceed()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            // Removed OverrideTenantId usage = tenantId;

            var request = new RegisterProviderRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@provider.com",
                Password = "Password123",
                TenantId = tenantId,
                PricingPlanId = Guid.NewGuid()
            };

            var pricingPlan = new PricingPlanDto
            {
                Id = request.PricingPlanId,
                Name = "Free Plan",
                Price = 0
            };

            var tenant = new Tenant
            {
                Id = tenantId,
                Name = "John's Clinic",
                Subdomain = "johnsclinic",
                ContactEmail = "admin@johnsclinic.com",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                UserType = UserRole.Provider,
                TenantId = tenantId,
                PasswordHash = "hashedPassword",
                PasswordSalt = "salt"
            };

            var subscription = new SubscriptionDto
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                PricingPlan = pricingPlan
            };

            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();

            _mockSubscriptionService.Setup(s => s.GetPricingPlanByIdAsync(request.PricingPlanId))
                .ReturnsAsync(pricingPlan);

            _mockUserService.Setup(s => s.CreateUser(It.IsAny<User>()))
                .ReturnsAsync(user);

            _mockSubscriptionService.Setup(s => s.CreateSubscriptionAsync(It.Is<CreateSubscriptionDto>(dto => dto.UserId == user.Id && dto.PricingPlanId == request.PricingPlanId)))
                .ReturnsAsync(subscription);

            _mockAuthenticationService.Setup(s => s.GenerateToken(It.Is<User>(u => u.Id == user.Id)))
                .Returns("access-token");

            _mockAuthenticationService.Setup(s => s.GenerateRefreshToken(It.Is<User>(u => u.Id == user.Id)))
                .Returns("refresh-token");

            // Act
            var result = await _registrationService.RegisterProviderAsync(request);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Provider registered successfully", result.Message);
            Assert.Equal(user.Id, result.User.Id);
            Assert.Equal(tenant.Id, result.Tenant.Id);
            Assert.Equal(subscription.Id, result.Subscription.Id);
            Assert.Equal("access-token", result.AccessToken);
            Assert.Equal("refresh-token", result.RefreshToken);

            _mockSubscriptionService.Verify(s => s.GetPricingPlanByIdAsync(request.PricingPlanId), Times.Once);
            _mockUserService.Verify(s => s.CreateUser(It.IsAny<User>()), Times.Once);
            _mockSubscriptionService.Verify(s => s.CreateSubscriptionAsync(It.IsAny<CreateSubscriptionDto>()), Times.Once);
            _mockAuthenticationService.Verify(s => s.GenerateToken(user), Times.Once);
            _mockAuthenticationService.Verify(s => s.GenerateRefreshToken(user), Times.Once);
        }

        [Fact]
        public async Task RegisterProviderAsync_ShouldReturnFailure_WhenTenantDoesNotExist()
        {
            // Arrange
            var request = new RegisterProviderRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@provider.com",
                Password = "Password123",
                TenantId = Guid.NewGuid(),
                PricingPlanId = Guid.NewGuid()
            };

            // Act
            var result = await _registrationService.RegisterProviderAsync(request);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Invalid tenant. Please check the tenant ID.", result.Message);
        }

        // [Fact]
        // public async Task RegisterProviderAsync_ShouldReturnFailure_WhenUserWithEmailAlreadyExistsInTenant()
        // {
        //     // Arrange
        //     var tenantId = Guid.NewGuid();
        //     var request = new RegisterProviderRequest
        //     {
        //         FirstName = "John",
        //         LastName = "Doe",
        //         Email = "john.doe@provider.com",
        //         Password = "Password123",
        //         TenantId = tenantId,
        //         PricingPlanId = Guid.NewGuid()
        //     };

        //     var tenant = new Tenant
        //     {
        //         Id = tenantId,
        //         Name = "John's Clinic"
        //     };

        //     var existingUser = new User
        //     {
        //         Id = Guid.NewGuid(),
        //         Email = request.Email,
        //         FirstName = "John",
        //         LastName = "Doe",
        //         UserType = UserRole.Provider,
        //         TenantId = tenantId,
        //         PasswordHash = "hashedPassword",
        //         PasswordSalt = "salt"
        //     };

        //     var users = new List<User> { existingUser }.AsQueryable();

        //     var mockUserSet = new Mock<DbSet<User>>();
        //     mockUserSet.As<IAsyncEnumerable<User>>()
        //         .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
        //         .Returns(new TestAsyncEnumerator<User>(users.GetEnumerator()));

        //     mockUserSet.As<IQueryable<User>>()
        //         .Setup(m => m.Provider)
        //         .Returns(new TestAsyncQueryProvider<User>(users.Provider));

        //     mockUserSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(users.Expression);
        //     mockUserSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(users.ElementType);
        //     mockUserSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => users.GetEnumerator());

        //     var mockContext = new Mock<ApplicationDbContext>(new DbContextOptions<ApplicationDbContext>(), new Mock<IHttpContextAccessor>().Object);
        //     mockContext.Setup(c => c.Users).Returns(mockUserSet.Object);
        //     mockContext.Setup(c => c.Tenants).Returns(_dbContext.Tenants);

        //     var registrationService = new RegistrationService(
        //         _mockTenantService.Object,
        //         _mockUserService.Object,
        //         _mockSubscriptionService.Object,
        //         _mockPaymentService.Object,
        //         _mockAuthenticationService.Object,
        //         mockContext.Object,
        //         _mockLogger.Object
        //     );

        //     _dbContext.Tenants.Add(tenant);
        //     await _dbContext.SaveChangesAsync();

        //     var pricingPlan = new PricingPlanDto
        //     {
        //         Id = request.PricingPlanId,
        //         Name = "Free Plan",
        //         Price = 0
        //     };

        //     _mockSubscriptionService.Setup(s => s.GetPricingPlanByIdAsync(request.PricingPlanId))
        //         .ReturnsAsync(pricingPlan);

        //     // Add a setup for CreateUser to prevent NullReferenceException, even though it shouldn't be called.
        //     _mockUserService.Setup(s => s.CreateUser(It.IsAny<User>())).ReturnsAsync(existingUser);

        //     // Act
        //     var result = await registrationService.RegisterProviderAsync(request);

        //     // Assert
        //     Assert.False(result.Success);
        //     Assert.Equal("User with this email already exists in this tenant.", result.Message);
        // }
        [Fact]
public async Task RegisterProviderAsync_ShouldReturnFailure_WhenUserWithEmailAlreadyExistsInTenant()
{
    // Arrange
    var tenantId = Guid.NewGuid();
    // Removed OverrideTenantId usage = tenantId; // Set the override like your working test

    var request = new RegisterProviderRequest
    {
        FirstName = "John",
        LastName = "Doe",
        Email = "john.doe@provider.com",
        Password = "Password123",
        TenantId = tenantId,
        PricingPlanId = Guid.NewGuid()
    };

    var tenant = new Tenant
    {
        Id = tenantId,
        Name = "John's Clinic",
        Subdomain = "johnsclinic",
        ContactEmail = "admin@johnsclinic.com",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    var existingUser = new User
    {
        Id = Guid.NewGuid(),
        Email = request.Email,
        FirstName = "John",
        LastName = "Doe",
        UserType = UserRole.Provider,
        TenantId = tenantId,
        PasswordHash = "hashedPassword",
        PasswordSalt = "salt",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
        IsActive = true
    };

    // Add tenant and existing user to database
    _dbContext.Tenants.Add(tenant);
    _dbContext.Users.Add(existingUser);
    await _dbContext.SaveChangesAsync();

    // Set up mock for pricing plan (still needed even though we expect early return)
    var pricingPlan = new PricingPlanDto
    {
        Id = request.PricingPlanId,
        Name = "Free Plan",
        Price = 0
    };

    _mockSubscriptionService.Setup(s => s.GetPricingPlanByIdAsync(request.PricingPlanId))
        .ReturnsAsync(pricingPlan);

    // Act
    var result = await _registrationService.RegisterProviderAsync(request);

    // Assert
    Assert.False(result.Success);
    Assert.Equal("User with this email already exists in this tenant.", result.Message);
    Assert.Null(result.User);
    Assert.Null(result.Tenant);
    Assert.Null(result.Subscription);
    Assert.Null(result.AccessToken);
    Assert.Null(result.RefreshToken);

    // Verify that CreateUser was NOT called since user already exists
    _mockUserService.Verify(s => s.CreateUser(It.IsAny<User>()), Times.Never);
    
    // Clean up - important for other tests
    // Removed OverrideTenantId usage = null;
}

        [Fact]
        public async Task RegisterProviderAsync_ShouldReturnFailure_WhenPricingPlanNotFound()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var request = new RegisterProviderRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@provider.com",
                Password = "Password123",
                TenantId = tenantId,
                PricingPlanId = Guid.NewGuid()
            };

            var tenant = new Tenant
            {
                Id = tenantId,
                Name = "John's Clinic",
                Subdomain = "johnsclinic",
                ContactEmail = "admin@johnsclinic.com",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();

            _mockSubscriptionService.Setup(s => s.GetPricingPlanByIdAsync(request.PricingPlanId))
                .ReturnsAsync((PricingPlanDto)null);

            // Act
            var result = await _registrationService.RegisterProviderAsync(request);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Invalid pricing plan selected.", result.Message);

            _mockSubscriptionService.Verify(s => s.GetPricingPlanByIdAsync(request.PricingPlanId), Times.Once);
        }

        [Fact]
        public async Task RegisterProviderAsync_ShouldReturnFailure_WhenPaymentRequiredButNotProvided()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var request = new RegisterProviderRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@provider.com",
                Password = "Password123",
                TenantId = tenantId,
                PricingPlanId = Guid.NewGuid()
            };

            var tenant = new Tenant
            {
                Id = tenantId,
                Name = "John's Clinic",
                Subdomain = "johnsclinic",
                ContactEmail = "admin@johnsclinic.com",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var pricingPlan = new PricingPlanDto
            {
                Id = request.PricingPlanId,
                Name = "Paid Plan",
                Price = 29.99m
            };

            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();

            _mockSubscriptionService.Setup(s => s.GetPricingPlanByIdAsync(request.PricingPlanId))
                .ReturnsAsync(pricingPlan);

            // Act
            var result = await _registrationService.RegisterProviderAsync(request);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Payment information is required for paid plans.", result.Message);

            _mockSubscriptionService.Verify(s => s.GetPricingPlanByIdAsync(request.PricingPlanId), Times.Once);
        }

        public void Dispose()
        {
            _dbContext?.Dispose();
            // Removed OverrideTenantId usage = null;
        }
    }

    // Helper classes for mocking DbSet
    internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider, IQueryProvider
    {
        private readonly IQueryProvider _inner;

        internal TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression)
        {
            return new TestAsyncEnumerable<TEntity>(expression);
        }

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        {
            return new TestAsyncEnumerable<TElement>(expression);
        }

        public object Execute(Expression expression)
        {
            return _inner.Execute(expression);
        }

        public TResult Execute<TResult>(Expression expression)
        {
            return _inner.Execute<TResult>(expression);
        }

        public IAsyncEnumerable<TResult> ExecuteAsync<TResult>(Expression expression)
        {
            return new TestAsyncEnumerable<TResult>(expression);
        }

        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken)
        {
            return Execute<TResult>(expression);
        }
    }

    internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable)
            : base(enumerable)
        { }

        public TestAsyncEnumerable(Expression expression)
            : base(expression)
        { }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        }

        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;

        public TestAsyncEnumerator(IEnumerator<T> inner)
        {
            _inner = inner;
        }

        public void Dispose()
        {
            _inner.Dispose();
        }

        public ValueTask<bool> MoveNextAsync()
        {
            return new ValueTask<bool>(_inner.MoveNext());
        }

        public T Current => _inner.Current;

        public ValueTask DisposeAsync()
        {
            _inner.Dispose();
            return new ValueTask();
        }
    }
}