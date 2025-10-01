using System;
using System.Threading.Tasks;
using Moq;
using Shared.Models;
using UserService.Services;
using Xunit;
using Microsoft.Extensions.Logging;
using UserService.Processors;
using Shared.Contracts;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace UserService.Tests.Services
{
    public class AuthenticationServiceTests
    {
        private readonly Mock<Shared.Contracts.IUserService> _mockUserService;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly Mock<ITokenService> _mockTokenService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<ILogger<AuthenticationService>> _mockLogger;
        private readonly AuthenticationService _authenticationService;

        public AuthenticationServiceTests()
        {
            _mockUserService = new Mock<Shared.Contracts.IUserService>();
            _mockJwtService = new Mock<IJwtService>();
            _mockTokenService = new Mock<ITokenService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockLogger = new Mock<ILogger<AuthenticationService>>();
            
            _authenticationService = new AuthenticationService(
                _mockJwtService.Object,
                _mockTokenService.Object,
                _mockUserService.Object,
                _mockConfiguration.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task Authenticate_ShouldReturnUser_WhenSuperAdminCredentialsAreValid()
        {
            // Arrange
            var username = "superadmin@admin.com";
            var password = "password123";
            var isSuperAdmin = true;
            var tenantId = (Guid?)null;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password), // Hash the password
                FirstName = "Super",
                LastName = "Admin",
                UserType = UserRole.SuperAdmin,
                IsActive = true
            };

            _mockUserService.Setup(s => s.GetSuperAdminUserByUsernameAsync(username)).ReturnsAsync(user);
            // Setup for password verification. Since we're not testing BCrypt logic, 
            // we can assume the service correctly calls BCrypt.Verify if the user is found.
            // The actual implementation in AuthenticationService.cs uses `BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)`
            // which we can't easily mock. For the test, we'll rely on the fact that if the user is returned
            // and the password matches (which it does because we hashed it the same way), it should work.
            // However, to make the test independent of BCrypt internal logic, we might need to abstract password verification.
            // For now, let's assume the service works correctly if the user is found and password matches.
            // A better approach would be to inject a password verification service, but that's out of scope here.

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.NotNull(authenticatedUser);
            Assert.Null(message);
            Assert.Equal(user.Id, authenticatedUser.Id);
            Assert.Equal(user.Email, authenticatedUser.Email);
            _mockUserService.Verify(s => s.GetSuperAdminUserByUsernameAsync(username), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenSuperAdminUserNotFound()
        {
            // Arrange
            var username = "nonexistent@admin.com";
            var password = "password123";
            var isSuperAdmin = true;
            var tenantId = (Guid?)null;

            _mockUserService.Setup(s => s.GetSuperAdminUserByUsernameAsync(username)).ReturnsAsync((User)null);

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.Null(authenticatedUser);
            Assert.Equal("Invalid username or password.", message);
            _mockUserService.Verify(s => s.GetSuperAdminUserByUsernameAsync(username), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenSuperAdminPasswordIsInvalid()
        {
            // Arrange
            var username = "superadmin@admin.com";
            var password = "wrongpassword";
            var correctPassword = "correctpassword";
            var isSuperAdmin = true;
            var tenantId = (Guid?)null;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword), // Hash with correct password
                FirstName = "Super",
                LastName = "Admin",
                UserType = UserRole.SuperAdmin,
                IsActive = true
            };

            _mockUserService.Setup(s => s.GetSuperAdminUserByUsernameAsync(username)).ReturnsAsync(user);
            // AuthenticationService.cs uses `BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)`
            // which will return false for a wrong password.

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.Null(authenticatedUser);
            Assert.Equal("Invalid username or password.", message);
            _mockUserService.Verify(s => s.GetSuperAdminUserByUsernameAsync(username), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnUser_WhenTenantUserCredentialsAreValid()
        {
            // Arrange
            var username = "user@tenant.com";
            var password = "password123";
            var isSuperAdmin = false;
            var tenantId = Guid.NewGuid();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password), // Hash the password
                FirstName = "Tenant",
                LastName = "User",
                UserType = UserRole.Customer, // or Provider
                TenantId = tenantId,
                IsActive = true
            };

            _mockUserService.Setup(s => s.GetUserByUsernameAndTenantAsync(username, tenantId)).ReturnsAsync(user);

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.NotNull(authenticatedUser);
            Assert.Null(message);
            Assert.Equal(user.Id, authenticatedUser.Id);
            Assert.Equal(user.Email, authenticatedUser.Email);
            Assert.Equal(tenantId, authenticatedUser.TenantId);
            _mockUserService.Verify(s => s.GetUserByUsernameAndTenantAsync(username, tenantId), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenTenantUserNotFound()
        {
            // Arrange
            var username = "nonexistent@tenant.com";
            var password = "password123";
            var isSuperAdmin = false;
            var tenantId = Guid.NewGuid();

            _mockUserService.Setup(s => s.GetUserByUsernameAndTenantAsync(username, tenantId)).ReturnsAsync((User)null);

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.Null(authenticatedUser);
            Assert.Equal("Invalid username or password.", message);
            _mockUserService.Verify(s => s.GetUserByUsernameAndTenantAsync(username, tenantId), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenTenantUserPasswordIsInvalid()
        {
            // Arrange
            var username = "user@tenant.com";
            var password = "wrongpassword";
            var correctPassword = "correctpassword";
            var isSuperAdmin = false;
            var tenantId = Guid.NewGuid();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword), // Hash with correct password
                FirstName = "Tenant",
                LastName = "User",
                UserType = UserRole.Customer,
                TenantId = tenantId,
                IsActive = true
            };

            _mockUserService.Setup(s => s.GetUserByUsernameAndTenantAsync(username, tenantId)).ReturnsAsync(user);

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.Null(authenticatedUser);
            Assert.Equal("Invalid username or password.", message);
            _mockUserService.Verify(s => s.GetUserByUsernameAndTenantAsync(username, tenantId), Times.Once);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenTenantIdIsNullForNonSuperAdmin()
        {
            // Arrange
            var username = "user@tenant.com";
            var password = "password123";
            var isSuperAdmin = false;
            Guid? tenantId = null; // This is an invalid state for a non-SuperAdmin login

            // Act
            var (authenticatedUser, message) = await _authenticationService.Authenticate(username, password, isSuperAdmin, tenantId);

            // Assert
            Assert.Null(authenticatedUser);
            Assert.Equal("Invalid tenant context.", message);
            _mockUserService.Verify(s => s.GetUserByUsernameAndTenantAsync(It.IsAny<string>(), It.IsAny<Guid>()), Times.Never);
            _mockUserService.Verify(s => s.GetSuperAdminUserByUsernameAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public void GenerateToken_ShouldCallJwtService_WithCorrectUser()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", UserType = UserRole.Customer, TenantId = Guid.NewGuid() };
            var expectedToken = "generated-jwt-token";
            _mockJwtService.Setup(s => s.GenerateToken(user)).Returns(expectedToken);

            // Act
            var token = _authenticationService.GenerateToken(user);

            // Assert
            Assert.Equal(expectedToken, token);
            _mockJwtService.Verify(s => s.GenerateToken(user), Times.Once);
        }

        [Fact]
        public void GenerateRefreshToken_ShouldCallTokenService_WithCorrectUser()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", UserType = UserRole.Customer, TenantId = Guid.NewGuid() };
            var expectedToken = "generated-refresh-token";
            _mockTokenService.Setup(s => s.GenerateRefreshToken(user)).Returns(expectedToken);

            // Act
            var token = _authenticationService.GenerateRefreshToken(user);

            // Assert
            Assert.Equal(expectedToken, token);
            _mockTokenService.Verify(s => s.GenerateRefreshToken(user), Times.Once);
        }
    }
}