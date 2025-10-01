using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using UserService.DTO;
using Shared.Models;
using Shared.Contracts;
using System.Diagnostics;
using UserService.Utils;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.DTOs;
using ConfigurationService.Services;
using PaymentService.Services;

namespace UserService.Services
{
    public class RegistrationService : IRegistrationService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.RegistrationService");
        private readonly ITenantService _tenantService;
        private readonly IUserService _userService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IPaymentService _paymentService;
        private readonly IAuthenticationService _authenticationService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<RegistrationService> _logger;

        public RegistrationService(
            ITenantService tenantService,
            IUserService userService,
            ISubscriptionService subscriptionService,
            IPaymentService paymentService,
            IAuthenticationService authenticationService,
            ApplicationDbContext dbContext,
            ILogger<RegistrationService> logger)
        {
            _tenantService = tenantService;
            _userService = userService;
            _subscriptionService = subscriptionService;
            _paymentService = paymentService;
            _authenticationService = authenticationService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<RegistrationResult> RegisterProviderAsync(RegisterProviderRequest request)
        {
            using var activity = ActivitySource.StartActivity("RegistrationService.RegisterProviderAsync");
            activity?.SetTag("tenant.id", request.TenantId.ToString());
            activity?.SetTag("user.email", request.Email);
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                // 1. Validate tenant exists
                var tenant = await _dbContext.Tenants
                    .FirstOrDefaultAsync(t => t.Id == request.TenantId);
                if (tenant == null)
                {
                    _logger.LogWarning("Registration failed: Tenant {TenantId} does not exist", request.TenantId);
                    activity?.SetStatus(ActivityStatusCode.Error, "Tenant does not exist");
                    return new RegistrationResult
                    {
                        Success = false,
                        Message = "Invalid tenant. Please check the tenant ID."
                    };
                }

                // 2. Validate user email uniqueness within tenant
                var existingUser = await _dbContext.Users.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.TenantId == request.TenantId);
                if (existingUser != null)
                {
                    _logger.LogWarning("Registration failed: User with email {Email} already exists in tenant {TenantId}", request.Email, request.TenantId);
                    activity?.SetStatus(ActivityStatusCode.Error, "User email already exists");
                    return new RegistrationResult
                    {
                        Success = false,
                        Message = "User with this email already exists in this tenant."
                    };
                }

                // 3. Get pricing plan details
                var pricingPlan = await _subscriptionService.GetPricingPlanByIdAsync(request.PricingPlanId);
                if (pricingPlan == null)
                {
                    _logger.LogWarning("Registration failed: Invalid pricing plan ID {PricingPlanId}", request.PricingPlanId);
                    activity?.SetStatus(ActivityStatusCode.Error, "Invalid pricing plan");
                    return new RegistrationResult
                    {
                        Success = false,
                        Message = "Invalid pricing plan selected."
                    };
                }

                // 4. Process payment for paid plans
                PaymentDetails? paymentDetails = null;
                if (pricingPlan.Price > 0)
                {
                    if (string.IsNullOrEmpty(request.PaymentMethod) || string.IsNullOrEmpty(request.CardToken))
                    {
                        _logger.LogWarning("Registration failed: Payment information required for paid plan");
                        activity?.SetStatus(ActivityStatusCode.Error, "Payment information required");
                        return new RegistrationResult
                        {
                            Success = false,
                            Message = "Payment information is required for paid plans."
                        };
                    }

                    // Process payment
                    var paymentRequest = new ProcessPaymentRequest
                    {
                        Amount = pricingPlan.Price,
                        Currency = pricingPlan.Currency,
                        PaymentMethod = request.PaymentMethod,
                        // In a real implementation, we would use the card token to process the payment
                        // For now, we'll just simulate a successful payment
                        CustomerId = Guid.Empty, // Will be updated after user creation
                        ProviderId = Guid.Empty, // Will be updated after user creation
                        TenantId = request.TenantId
                    };

                    try
                    {
                        paymentDetails = await _paymentService.ProcessPaymentAsync(paymentRequest);
                        if (paymentDetails.PaymentStatus != "Completed")
                        {
                            _logger.LogWarning("Registration failed: Payment processing failed");
                            activity?.SetStatus(ActivityStatusCode.Error, "Payment processing failed");
                            return new RegistrationResult
                            {
                                Success = false,
                                Message = "Payment processing failed. Please try again."
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing payment for registration");
                        activity?.SetStatus(ActivityStatusCode.Error, "Payment processing error");
                        return new RegistrationResult
                        {
                            Success = false,
                            Message = "Error processing payment. Please try again."
                        };
                    }
                }

                // 5. Create user within a transaction
                User user;
                Shared.DTOs.SubscriptionDto subscription;

                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Create user
                        user = new User
                        {
                            Email = request.Email,
                            PasswordHash = request.Password, // Will be hashed in the service
                            FirstName = request.FirstName,
                            LastName = request.LastName,
                            PhoneNumber = request.PhoneNumber,
                            UserType = UserRole.Provider,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            TenantId = request.TenantId,
                            PasswordSalt = string.Empty // Initialize PasswordSalt to prevent null reference issues
                        };

                        user = await _userService.CreateUser(user);
                        activity?.SetTag("user.id", user.Id.ToString());

                        // Update payment details with user and tenant information if payment was processed
                        if (paymentDetails != null)
                        {
                            // In a real implementation, we would update the payment record with the actual user/tenant IDs
                            // For now, we'll just log that this would happen
                            _logger.LogInformation("Payment processed for user {UserId} and tenant {TenantId}", user.Id, request.TenantId);
                        }

                        // Create subscription
                        var createSubscriptionDto = new CreateSubscriptionDto
                        {
                            UserId = user.Id,
                            PricingPlanId = request.PricingPlanId
                        };

                        subscription = await _subscriptionService.CreateSubscriptionAsync(createSubscriptionDto);

                        // Commit transaction
                        await transaction.CommitAsync();
                        
                        _logger.LogInformation("Successfully registered provider {UserId} for tenant {TenantId}", user.Id, request.TenantId);
                        activity?.SetStatus(ActivityStatusCode.Ok);
                    }
                    catch (Exception ex)
                    {
                        // Rollback transaction
                        await transaction.RollbackAsync();
                        
                        _logger.LogError(ex, "Error during provider registration transaction");
                        activity?.SetStatus(ActivityStatusCode.Error, "Registration transaction failed");
                        return new RegistrationResult
                        {
                            Success = false,
                            Message = "Registration failed due to a system error. Please try again."
                        };
                    }
                }

                // 6. Generate authentication tokens
                var accessToken = _authenticationService.GenerateToken(user);
                var refreshToken = _authenticationService.GenerateRefreshToken(user);

                return new RegistrationResult
                {
                    Success = true,
                    Message = "Provider registered successfully",
                    User = user,
                    Tenant = tenant,
                    Subscription = subscription,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during provider registration");
                activity?.SetStatus(ActivityStatusCode.Error, "Unexpected error");
                return new RegistrationResult
                {
                    Success = false,
                    Message = "An unexpected error occurred during registration. Please try again."
                };
            }
        }
    }
}