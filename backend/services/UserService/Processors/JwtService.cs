using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using UserService.Utils;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace UserService.Processors
{
    public interface IJwtService
    {
        string GenerateToken(Shared.Models.User user);
        string? GetUserIdFromToken(string token);
        bool ValidateToken(string token);
    }

    public class JwtService : IJwtService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.JwtService");
        private readonly string _secretKey = null!;
        private readonly ILogger<JwtService> _logger;

        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _secretKey = _configuration["Jwt:SecretKey"] ?? throw new ArgumentNullException("Jwt:SecretKey", "Jwt:SecretKey is missing from configuration");
            _logger = logger;
        }

        public string GenerateToken(Shared.Models.User user)
        {
            using var activity = ActivitySource.StartActivity("JwtService.GenerateToken");
            activity?.SetTag("user.id", user?.Id.ToString());
            activity?.SetTag("user.role", user?.UserType.ToString());
            activity?.SetTag("tenant.id", user?.TenantId.ToString());
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user), "User cannot be null.");
                }

                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claimsList = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim("UserRole", user.UserType.ToString())
                };

                // Add TenantId claim only if the user is not a SuperAdmin
                // SuperAdmins have TenantId = Guid.Empty
                if (user.UserType != Shared.Models.UserRole.SuperAdmin)
                {
                    claimsList.Add(new Claim("TenantId", user.TenantId.ToString()));
                }
                // For SuperAdmin, we omit the TenantId claim

                var token = new JwtSecurityToken(
                    _configuration["Jwt:Issuer"] ?? "Issuer",
                    _configuration["Jwt:Audience"] ?? "Audience",
                    claimsList,
                    expires: DateTime.Now.AddMinutes(120),
                    signingCredentials: credentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for user {UserId}", user?.Id);
                activity?.SetStatus(ActivityStatusCode.Error);
                throw;
            }
        }

        public bool ValidateToken(string token)
        {
            using var activity = ActivitySource.StartActivity("JwtService.ValidateToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(token));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_secretKey);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                activity?.SetStatus(ActivityStatusCode.Ok);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating JWT token.");
                activity?.SetStatus(ActivityStatusCode.Error);
                return false;
            }
        }

        public string? GetUserIdFromToken(string token)
        {
            using var activity = ActivitySource.StartActivity("JwtService.GetUserIdFromToken");
            activity?.SetTag("token.present", !string.IsNullOrWhiteSpace(token));
            
            LoggingExtensions.AddTraceIdToLogContext();
            
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_secretKey);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;
                activity?.SetTag("user.id", userId);
                activity?.SetStatus(ActivityStatusCode.Ok);
                return userId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user ID from JWT token.");
                activity?.SetStatus(ActivityStatusCode.Error);
                return null;
            }
        }
    }
}