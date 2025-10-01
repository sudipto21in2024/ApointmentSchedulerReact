using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Models;
using UserService.Controllers;
using UserService.DTO;
using UserService.Services;
using UserService.Utils;
using Xunit;
using Shared.Contracts;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;

namespace UserService.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthenticationService> _mockAuthenticationService;
        private readonly Mock<Shared.Contracts.IUserService> _mockUserService;
        private readonly Mock<ITenantResolutionService> _mockTenantResolutionService;
        private readonly Mock<UserService.Services.IRegistrationService> _mockRegistrationService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly Mock<IValidator<LoginRequest>> _mockLoginRequestValidator;
        private readonly Mock<IValidator<RegisterRequest>> _mockRegisterRequestValidator;
        private readonly Mock<IValidator<RegisterProviderRequest>> _mockRegisterProviderRequestValidator;
        private readonly Mock<IValidator<RefreshRequest>> _mockRefreshRequestValidator;
        private readonly Mock<IValidator<PasswordResetRequest>> _mockPasswordResetRequestValidator;
        private readonly Mock<IValidator<ResetPasswordRequest>> _mockResetPasswordRequestValidator;
        private readonly AuthController _authController;

        public AuthControllerTests()
        {
            _mockAuthenticationService = new Mock<IAuthenticationService>();
            _mockUserService = new Mock<Shared.Contracts.IUserService>();
            _mockTenantResolutionService = new Mock<ITenantResolutionService>();
            _mockRegistrationService = new Mock<UserService.Services.IRegistrationService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _mockLoginRequestValidator = new Mock<IValidator<LoginRequest>>();
            _mockRegisterRequestValidator = new Mock<IValidator<RegisterRequest>>();
            _mockRegisterProviderRequestValidator = new Mock<IValidator<RegisterProviderRequest>>();
            _mockRefreshRequestValidator = new Mock<IValidator<RefreshRequest>>();
            _mockPasswordResetRequestValidator = new Mock<IValidator<PasswordResetRequest>>();
            _mockResetPasswordRequestValidator = new Mock<IValidator<ResetPasswordRequest>>();

            // Setup default validation results to be valid
            _mockLoginRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<LoginRequest>(), default))
                .ReturnsAsync(new ValidationResult());
            _mockRegisterRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RegisterRequest>(), default))
                .ReturnsAsync(new ValidationResult());
            _mockRegisterProviderRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RegisterProviderRequest>(), default))
                .ReturnsAsync(new ValidationResult());
            _mockRefreshRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RefreshRequest>(), default))
                .ReturnsAsync(new ValidationResult());
            _mockPasswordResetRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<PasswordResetRequest>(), default))
                .ReturnsAsync(new ValidationResult());
            _mockResetPasswordRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<ResetPasswordRequest>(), default))
                .ReturnsAsync(new ValidationResult());

            _authController = new AuthController(
                _mockAuthenticationService.Object,
                _mockUserService.Object,
                _mockTenantResolutionService.Object,
                _mockRegistrationService.Object,
                _mockLogger.Object,
                Mock.Of<MassTransit.IPublishEndpoint>(), // Not used in Login tests
                _mockLoginRequestValidator.Object,
                _mockRegisterRequestValidator.Object,
                _mockRegisterProviderRequestValidator.Object,
                _mockRefreshRequestValidator.Object,
                _mockPasswordResetRequestValidator.Object,
                _mockResetPasswordRequestValidator.Object
            );
        }

        [Fact]
        public async Task Login_ShouldReturnOkResult_WithTokenAndUser_WhenSuperAdminCredentialsAreValid()
        {
            // Arrange
            var request = new LoginRequest { Username = "superadmin@admin.com", Password = "password123" };
            
            var tenantResolutionResult = new TenantResolutionResult
            {
                IsSuperAdmin = true,
                IsResolved = true
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Username,
                FirstName = "Super",
                LastName = "Admin",
                UserType = UserRole.SuperAdmin,
                TenantId = Guid.Empty
            };

            var accessToken = "jwt-access-token";
            var refreshToken = "refresh-token";

            _mockTenantResolutionService.Setup(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()))
                .ReturnsAsync(tenantResolutionResult);

            _mockAuthenticationService.Setup(s => s.Authenticate(request.Username, request.Password, true, null))
                .ReturnsAsync((user, (string)null)); // No error message

            _mockAuthenticationService.Setup(s => s.GenerateToken(user)).Returns(accessToken);
            _mockAuthenticationService.Setup(s => s.GenerateRefreshToken(user)).Returns(refreshToken);

            // Act
            var result = await _authController.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var loginResponse = Assert.IsType<LoginResponse>(okResult.Value);
            Assert.Equal(accessToken, loginResponse.AccessToken);
            Assert.Same(user, loginResponse.User);
            
            _mockTenantResolutionService.Verify(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()), Times.Once);
            _mockAuthenticationService.Verify(s => s.Authenticate(request.Username, request.Password, true, null), Times.Once);
            _mockAuthenticationService.Verify(s => s.GenerateToken(user), Times.Once);
        }

        [Fact]
        public async Task Login_ShouldReturnOkResult_WithTokenAndUser_WhenTenantUserCredentialsAreValid()
        {
            // Arrange
            var request = new LoginRequest { Username = "user@tenant.com", Password = "password123" };
            var tenantId = Guid.NewGuid();
            
            var tenantResolutionResult = new TenantResolutionResult
            {
                IsSuperAdmin = false,
                TenantId = tenantId,
                IsResolved = true
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Username,
                FirstName = "Tenant",
                LastName = "User",
                UserType = UserRole.Customer,
                TenantId = tenantId
            };

            var accessToken = "jwt-access-token";
            var refreshToken = "refresh-token";

            _mockTenantResolutionService.Setup(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()))
                .ReturnsAsync(tenantResolutionResult);

            _mockAuthenticationService.Setup(s => s.Authenticate(request.Username, request.Password, false, tenantId))
                .ReturnsAsync((user, (string)null)); // No error message

            _mockAuthenticationService.Setup(s => s.GenerateToken(user)).Returns(accessToken);
            _mockAuthenticationService.Setup(s => s.GenerateRefreshToken(user)).Returns(refreshToken);

            // Act
            var result = await _authController.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var loginResponse = Assert.IsType<LoginResponse>(okResult.Value);
            Assert.Equal(accessToken, loginResponse.AccessToken);
            Assert.Same(user, loginResponse.User);
            Assert.Equal(tenantId, loginResponse.User.TenantId);
            
            _mockTenantResolutionService.Verify(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()), Times.Once);
            _mockAuthenticationService.Verify(s => s.Authenticate(request.Username, request.Password, false, tenantId), Times.Once);
            _mockAuthenticationService.Verify(s => s.GenerateToken(user), Times.Once);
        }

        [Fact]
        public async Task Login_ShouldReturnBadRequest_WhenTenantCannotBeResolved()
        {
            // Arrange
            var request = new LoginRequest { Username = "user@unknown.com", Password = "password123" };
            
            var tenantResolutionResult = new TenantResolutionResult
            {
                IsResolved = false // Indicates failure to resolve
            };

            _mockTenantResolutionService.Setup(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()))
                .ReturnsAsync(tenantResolutionResult);

            // Act
            var result = await _authController.Login(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.IsType<string>(badRequestResult.Value); // Should be a string error message
            // Optionally, check the content of the message if needed.
            
            _mockTenantResolutionService.Verify(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()), Times.Once);
            _mockAuthenticationService.Verify(s => s.Authenticate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Guid?>()), Times.Never);
        }

        [Fact]
        public async Task Login_ShouldReturnBadRequest_WhenAuthenticationFails()
        {
            // Arrange
            var request = new LoginRequest { Username = "user@tenant.com", Password = "wrongpassword" };
            var tenantId = Guid.NewGuid();
            
            var tenantResolutionResult = new TenantResolutionResult
            {
                IsSuperAdmin = false,
                TenantId = tenantId,
                IsResolved = true
            };

            var errorMessage = "Invalid username or password.";

            _mockTenantResolutionService.Setup(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()))
                .ReturnsAsync(tenantResolutionResult);

            _mockAuthenticationService.Setup(s => s.Authenticate(request.Username, request.Password, false, tenantId))
                .ReturnsAsync(((User)null, errorMessage)); // Error message returned

            // Act
            var result = await _authController.Login(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(errorMessage, badRequestResult.Value);
            
            _mockTenantResolutionService.Verify(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()), Times.Once);
            _mockAuthenticationService.Verify(s => s.Authenticate(request.Username, request.Password, false, tenantId), Times.Once);
            _mockAuthenticationService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task Login_ShouldReturnBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var request = new LoginRequest { Username = "", Password = "" }; // Invalid model
            
            var validationFailure = new ValidationFailure("Username", "Username is required.");
            var validationResult = new ValidationResult(new List<ValidationFailure> { validationFailure });
            
            _mockLoginRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<LoginRequest>(), default))
                .ReturnsAsync(validationResult);

            // Act
            var result = await _authController.Login(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            // The value should be a collection of anonymous objects with Field and Message properties.
            // We can assert the type, but checking the exact content might be more complex.
            Assert.NotNull(badRequestResult.Value);
            
            _mockTenantResolutionService.Verify(s => s.ResolveTenantAsync(It.IsAny<HttpContext>()), Times.Never);
            _mockAuthenticationService.Verify(s => s.Authenticate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Guid?>()), Times.Never);
        }

        [Fact]
        public async Task RegisterProvider_ShouldReturnCreatedResult_WhenRegistrationIsSuccessful()
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

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                UserType = UserRole.Provider,
                TenantId = tenantId
            };

            var tenant = new Tenant
            {
                Id = tenantId,
                Name = "John's Clinic"
            };

            var subscription = new Shared.DTOs.SubscriptionDto
            {
                Id = Guid.NewGuid(),
                UserId = user.Id
            };

            var registrationResult = new RegistrationResult
            {
                Success = true,
                User = user,
                Tenant = tenant,
                Subscription = subscription,
                AccessToken = "access-token",
                RefreshToken = "refresh-token"
            };

            _mockRegisterProviderRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RegisterProviderRequest>(), default))
                .ReturnsAsync(new ValidationResult());

            _mockRegistrationService.Setup(s => s.RegisterProviderAsync(request))
                .ReturnsAsync(registrationResult);

            // Act
            var result = await _authController.RegisterProvider(request);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedResult = Assert.IsType<RegistrationResult>(createdResult.Value);
            Assert.True(returnedResult.Success);
            Assert.Same(user, returnedResult.User);
            Assert.Same(tenant, returnedResult.Tenant);
            Assert.Same(subscription, returnedResult.Subscription);
            Assert.Equal("access-token", returnedResult.AccessToken);
            Assert.Equal("refresh-token", returnedResult.RefreshToken);

            _mockRegisterProviderRequestValidator.Verify(v => v.ValidateAsync(request, default), Times.Once);
            _mockRegistrationService.Verify(s => s.RegisterProviderAsync(request), Times.Once);
        }

        [Fact]
        public async Task RegisterProvider_ShouldReturnBadRequest_WhenValidationFails()
        {
            // Arrange
            var request = new RegisterProviderRequest
            {
                FirstName = "", // Invalid - required field
                LastName = "Doe",
                Email = "invalid-email", // Invalid email format
                Password = "123", // Invalid - too short
                TenantId = Guid.NewGuid(),
                PricingPlanId = Guid.NewGuid()
            };

            var validationFailures = new List<ValidationFailure>
            {
                new ValidationFailure("FirstName", "First name is required."),
                new ValidationFailure("Email", "Invalid email format."),
                new ValidationFailure("Password", "Password must be at least 8 characters long.")
            };

            var validationResult = new ValidationResult(validationFailures);

            _mockRegisterProviderRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RegisterProviderRequest>(), default))
                .ReturnsAsync(validationResult);

            // Act
            var result = await _authController.RegisterProvider(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            // The value should be a collection of anonymous objects with Field and Message properties.
            Assert.NotNull(badRequestResult.Value);

            _mockRegisterProviderRequestValidator.Verify(v => v.ValidateAsync(request, default), Times.Once);
            _mockRegistrationService.Verify(s => s.RegisterProviderAsync(It.IsAny<RegisterProviderRequest>()), Times.Never);
        }

        [Fact]
        public async Task RegisterProvider_ShouldReturnBadRequest_WhenRegistrationServiceReturnsFailure()
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

            var registrationResult = new RegistrationResult
            {
                Success = false,
                Message = "Invalid tenant."
            };

            _mockRegisterProviderRequestValidator.Setup(v => v.ValidateAsync(It.IsAny<RegisterProviderRequest>(), default))
                .ReturnsAsync(new ValidationResult());

            _mockRegistrationService.Setup(s => s.RegisterProviderAsync(request))
                .ReturnsAsync(registrationResult);

            // Act
            var result = await _authController.RegisterProvider(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid tenant.", badRequestResult.Value);

            _mockRegisterProviderRequestValidator.Verify(v => v.ValidateAsync(request, default), Times.Once);
            _mockRegistrationService.Verify(s => s.RegisterProviderAsync(request), Times.Once);
        }
    }
}