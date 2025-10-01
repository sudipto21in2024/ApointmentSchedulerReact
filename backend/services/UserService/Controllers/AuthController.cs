using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;
using Shared.Models;
using Shared.Events;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using BCrypt.Net;
using System;
using UserService.DTO;
using MassTransit;
using System.Diagnostics;
using UserService.Utils;
using FluentValidation;
using UserService.Services;


namespace UserService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Shared.Contracts.IAuthenticationService _authenticationService;
        private readonly IUserService _userService;
        private readonly UserService.Utils.ITenantResolutionService _tenantResolutionService;
        private readonly UserService.Services.IRegistrationService _registrationService;
        private readonly ILogger<AuthController> _logger;
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.AuthController");
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IValidator<LoginRequest> _loginRequestValidator;
        private readonly IValidator<RegisterRequest> _registerRequestValidator;
        private readonly IValidator<RegisterProviderRequest> _registerProviderRequestValidator;
        private readonly IValidator<RefreshRequest> _refreshRequestValidator;
        private readonly IValidator<PasswordResetRequest> _passwordResetRequestValidator;
        private readonly IValidator<ResetPasswordRequest> _resetPasswordRequestValidator;

        public AuthController(Shared.Contracts.IAuthenticationService authenticationService, IUserService userService, UserService.Utils.ITenantResolutionService tenantResolutionService, UserService.Services.IRegistrationService registrationService, ILogger<AuthController> logger, IPublishEndpoint publishEndpoint,
            IValidator<LoginRequest> loginRequestValidator, IValidator<RegisterRequest> registerRequestValidator, IValidator<RegisterProviderRequest> registerProviderRequestValidator,
            IValidator<RefreshRequest> refreshRequestValidator, IValidator<PasswordResetRequest> passwordResetRequestValidator,
            IValidator<ResetPasswordRequest> resetPasswordRequestValidator)
        {
            _authenticationService = authenticationService;
            _userService = userService;
            _tenantResolutionService = tenantResolutionService;
            _registrationService = registrationService;
            _logger = logger;
            _publishEndpoint = publishEndpoint;
            _loginRequestValidator = loginRequestValidator;
            _registerRequestValidator = registerRequestValidator;
            _registerProviderRequestValidator = registerProviderRequestValidator;
            _refreshRequestValidator = refreshRequestValidator;
            _passwordResetRequestValidator = passwordResetRequestValidator;
            _resetPasswordRequestValidator = resetPasswordRequestValidator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.Login");
            activity?.SetTag("user.email", request.Username);
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _loginRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }

                // Resolve tenant context
                var tenantResolutionResult = await _tenantResolutionService.ResolveTenantAsync(HttpContext);
                if (!tenantResolutionResult.IsResolved)
                {
                    _logger.LogWarning($"Login failed for user {request.Username}: Unable to resolve tenant context.");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("Unable to resolve tenant context. Please check the URL.");
                }

                (Shared.Models.User? user, string? message) = await _authenticationService.Authenticate(
                    request.Username,
                    request.Password,
                    tenantResolutionResult.IsSuperAdmin,
                    tenantResolutionResult.TenantId
                );
                
                if (user is null)
                {
                    _logger.LogWarning($"Login failed for user {request.Username}: {message}");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(message);
                }
                
                _logger.LogInformation($"User {request.Username} logged in successfully.");
                activity?.SetTag("user.id", user.Id.ToString());
                activity?.SetTag("user.role", user.UserType.ToString());
                activity?.SetTag("tenant.id", user.TenantId.ToString());
                
                var token = _authenticationService.GenerateToken(user);
                activity?.SetStatus(ActivityStatusCode.Ok);
                
                return Ok(new LoginResponse { AccessToken = token, User = user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user {Username}", request.Username);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.Register");
            activity?.SetTag("user.email", request.Email);
            activity?.SetTag("user.type", request.UserType.ToString());
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _registerRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }

                // Check if user already exists
                var existingUser = await _userService.GetUserByUsername(request.Email);
                if (existingUser != null)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("User with this email already exists.");
                }

                _logger.LogInformation($"Registration requested for user {request.Email} with role {request.UserType}");
            
                // Create new user
                var user = new Shared.Models.User
                {
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PhoneNumber = request.PhoneNumber,
                    UserType = request.UserType,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    TenantId = request.TenantId
                };
            
                // Save user to database
                var createdUser = await _userService.CreateUser(user);
                activity?.SetTag("user.id", createdUser.Id.ToString());
            
                // Publish UserRegisteredEvent
                var userRegisteredEvent = new UserRegisteredEvent
                {
                    UserId = createdUser.Id,
                    Email = createdUser.Email,
                    FirstName = createdUser.FirstName,
                    LastName = createdUser.LastName,
                    UserType = createdUser.UserType.ToString(),
                    TenantId = createdUser.TenantId,
                    RegisteredAt = DateTime.UtcNow
                };
            
                await _publishEndpoint.Publish(userRegisteredEvent);
            
                _logger.LogInformation($"User {createdUser.Email} registered successfully and UserRegisteredEvent published.");
                activity?.SetStatus(ActivityStatusCode.Ok);
            
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, new UserResponse { User = createdUser });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user {Email}", request.Email);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout([FromBody] LogoutRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.Logout");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(request.Token));
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Basic validation for logout request
                if (string.IsNullOrWhiteSpace(request.Token))
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("Token is required.");
                }
            
                var result = _authenticationService.InvalidateRefreshToken(request.Token);
                if (result)
                {
                    _logger.LogInformation("User logged out successfully");
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return Ok(new { message = "Logged out successfully" });
                }
            
                _logger.LogWarning("Failed to logout user");
                activity?.SetStatus(ActivityStatusCode.Error);
                return BadRequest("Failed to logout");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.Refresh");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(request.RefreshToken));
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _refreshRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }
            
                // Validate the refresh token
                var isValid = _authenticationService.ValidateRefreshToken(request.RefreshToken);
                if (!isValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("Invalid refresh token.");
                }
            
                // Get user from refresh token
                var user = _authenticationService.GetUserFromRefreshToken(request.RefreshToken);
                if (user == null)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("Unable to retrieve user from refresh token.");
                }
                
                activity?.SetTag("user.id", user.Id.ToString());
                activity?.SetTag("user.email", user.Email);
            
                // Generate new access token
                var newAccessToken = _authenticationService.GenerateToken(user);
            
                // Generate new refresh token
                var newRefreshToken = _authenticationService.GenerateRefreshToken(user);
            
                // Invalidate the old refresh token
                _authenticationService.InvalidateRefreshToken(request.RefreshToken);
            
                _logger.LogInformation($"Token refreshed for user {user.Email}");
                activity?.SetStatus(ActivityStatusCode.Ok);
                return Ok(new RefreshResponse { AccessToken = newAccessToken, RefreshToken = newRefreshToken });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.RequestPasswordReset");
            activity?.SetTag("email.present", !string.IsNullOrWhiteSpace(request.Email));
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _passwordResetRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }
            
                // Check if user exists
                var user = await _userService.GetUserByUsername(request.Email);
                if (user == null)
                {
                    // We don't want to reveal if the email exists or not for security reasons
                    activity?.SetStatus(ActivityStatusCode.Ok); // Not an error from a security perspective
                    return Ok(new { message = "Password reset instructions sent if email exists" });
                }
                
                activity?.SetTag("user.id", user.Id.ToString());
            
                // In a real implementation, this would send a password reset email with a token
                // For now, we'll just log that a reset was requested
                _logger.LogInformation($"Password reset requested for email: {request.Email}");
                activity?.SetStatus(ActivityStatusCode.Ok);
                return Ok(new { message = "Password reset instructions sent if email exists" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset request for email {Email}", request.Email);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.ResetPassword");
            activity?.SetTag("email.present", !string.IsNullOrWhiteSpace(request.Email));
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(request.Token));
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _resetPasswordRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }
            
                // Check if user exists
                var user = await _userService.GetUserByUsername(request.Email);
                if (user == null)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest("Invalid request.");
                }
                
                activity?.SetTag("user.id", user.Id.ToString());
            
                // In a real implementation, this would validate the reset token
                // For now, we'll just update the password directly
                var result = await _authenticationService.ChangePassword(user, request.NewPassword);
                if (result)
                {
                    _logger.LogInformation($"Password reset successfully for email: {request.Email}");
                    activity?.SetStatus(ActivityStatusCode.Ok);
                    return Ok(new { message = "Password reset successfully" });
                }
            
                _logger.LogWarning($"Failed to reset password for email: {request.Email}");
                activity?.SetStatus(ActivityStatusCode.Error);
                return BadRequest("Failed to reset password");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset for email {Email}", request.Email);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpPost("register/provider")]
        public async Task<IActionResult> RegisterProvider([FromBody] RegisterProviderRequest request)
        {
            using var activity = ActivitySource.StartActivity("AuthController.RegisterProvider");
            activity?.SetTag("tenant.Id", request.TenantId);
            activity?.SetTag("user.email", request.Email);
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                // Validate the request
                var validationResult = await _registerProviderRequestValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage }));
                }

                _logger.LogInformation($"Provider registration requested for {request.Email} with tenant {request.TenantId}");
             
                // Register the provider
                var result = await _registrationService.RegisterProviderAsync(request);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Provider registration failed for {request.Email}: {result.Message}");
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return BadRequest(result.Message);
                }
                
                _logger.LogInformation($"Provider {result.User?.Email} registered successfully for tenant {result.Tenant?.Name}");
                activity?.SetStatus(ActivityStatusCode.Ok);
             
                return CreatedAtAction(nameof(GetUser), new { id = result.User?.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during provider registration for {Email}", request.Email);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            using var activity = ActivitySource.StartActivity("AuthController.GetUser");
            activity?.SetTag("user.id", id.ToString());
             
            LoggingExtensions.AddTraceIdToLogContext();
             
            try
            {
                var user = await _userService.GetUserById(id);
                if (user == null)
                {
                    activity?.SetStatus(ActivityStatusCode.Error);
                    return NotFound($"User with ID {id} not found.");
                }
             
                activity?.SetStatus(ActivityStatusCode.Ok);
                return Ok(new UserResponse { User = user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {UserId}", id);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }
    }
}