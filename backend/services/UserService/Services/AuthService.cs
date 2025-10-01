using Shared.Models;
using UserService.Processors; // Importing the namespace for IJwtService
using Microsoft.Extensions.Configuration;
using BCrypt.Net;
using Shared.Contracts;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.Diagnostics;
using UserService.Utils;

namespace UserService.Services
{
    public class AuthenticationService : Shared.Contracts.IAuthenticationService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.AuthenticationService");
        private readonly IJwtService _jwtService;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(IJwtService jwtService, ITokenService tokenService, IUserService userService, IConfiguration configuration, ILogger<AuthenticationService> logger)
        {
            _jwtService = jwtService;
            _tokenService = tokenService;
            _userService = userService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<(User?, string?)> Authenticate(string username, string password, bool isSuperAdmin, Guid? tenantId)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.Authenticate");
            activity?.SetTag("user.username", username);
            activity?.SetTag("is.superadmin", isSuperAdmin);
            activity?.SetTag("tenant.id", tenantId?.ToString() ?? "null");
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                User? user = null;
                
                if (isSuperAdmin)
                {
                    user = await _userService.GetSuperAdminUserByUsernameAsync(username);
                }
                else if (tenantId.HasValue)
                {
                    user = await _userService.GetUserByUsernameAndTenantAsync(username, tenantId.Value);
                }
                else
                {
                    // This should not happen for a valid tenant-specific login request
                    _logger.LogWarning($"Authentication failed for username: {username}. Invalid tenant context: isSuperAdmin=false, tenantId=null.");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return (null, "Invalid tenant context.");
                }

                if (user == null)
                {
                    _logger.LogInformation($"Authentication failed for username: {username}. User not found in the specified context (SuperAdmin: {isSuperAdmin}, TenantId: {tenantId?.ToString() ?? "null"}).");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return (null, "Invalid username or password.");
                }

                if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    _logger.LogInformation($"Authentication failed for username: {username}. Invalid password.");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return (null, "Invalid username or password.");
                }
                
                activity?.SetTag("user.id", user.Id.ToString());
                activity?.SetStatus(ActivityStatusCode.Ok);
                return (user, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for user {Username}", username);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public string GenerateToken(User user)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.GenerateToken");
            activity?.SetTag("user.id", user?.Id.ToString());
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var token = _jwtService.GenerateToken(user ?? throw new ArgumentNullException(nameof(user), "User cannot be null."));
                activity?.SetStatus(ActivityStatusCode.Ok);
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating token for user {UserId}", user?.Id);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public string GenerateRefreshToken(User user)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.GenerateRefreshToken");
            activity?.SetTag("user.id", user?.Id.ToString());
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var token = _tokenService.GenerateRefreshToken(user ?? throw new ArgumentNullException(nameof(user), "User cannot be null."));
                activity?.SetStatus(ActivityStatusCode.Ok);
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating refresh token for user {UserId}", user?.Id);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public bool ValidateRefreshToken(string refreshToken)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.ValidateRefreshToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(refreshToken));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var result = _tokenService.ValidateRefreshToken(refreshToken);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public User? GetUserFromRefreshToken(string refreshToken)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.GetUserFromRefreshToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(refreshToken));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var user = _tokenService.GetUserFromRefreshToken(refreshToken);
                activity?.SetTag("user.id", user?.Id.ToString());
                activity?.SetStatus(ActivityStatusCode.Ok);
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user from refresh token");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public bool InvalidateRefreshToken(string refreshToken)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.InvalidateRefreshToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(refreshToken));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var result = _tokenService.InvalidateRefreshToken(refreshToken);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating refresh token");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public async Task<bool> ChangePassword(User user, string newPassword)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.ChangePassword");
            activity?.SetTag("user.id", user?.Id.ToString());
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                // Implement password security requirements here
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                var result = await _userService.UpdatePassword(user ?? throw new ArgumentNullException(nameof(user), "User cannot be null."), hashedPassword);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", user?.Id);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public bool ValidateJwtToken(string token)
        {
            using var activity = ActivitySource.StartActivity("AuthenticationService.ValidateJwtToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(token));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var result = _jwtService.ValidateToken(token);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating JWT token");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }
    }
}