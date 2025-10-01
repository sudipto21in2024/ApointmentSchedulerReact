using Shared.Contracts;
using Shared.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using BCrypt.Net;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration; // For IConfiguration
using Shared.Data; // For ApplicationDbContext
using Microsoft.EntityFrameworkCore; // For FirstOrDefaultAsync

namespace AuthenticationService.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private static readonly ActivitySource ActivitySource = new ActivitySource("AuthenticationService.AuthenticationService");
        private readonly ILogger<AuthenticationService> _logger;
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context; // For refresh token management

        public AuthenticationService(
            ILogger<AuthenticationService> logger,
            IUserService userService,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _logger = logger;
            _userService = userService;
            _configuration = configuration;
            _context = context;
        }

        public async Task<(User?, string?)> Authenticate(string email, string password)
        {
            using var activity = ActivitySource.StartActivity("Authenticate");
            activity?.SetTag("user.email", email);

            try
            {
                var user = await _userService.GetUserByUsername(email);
                if (user == null || !user.IsActive)
                {
                    _logger.LogWarning("Authentication failed for email {Email}: User not found or inactive.", email);
                    activity?.SetStatus(ActivityStatusCode.Error, "User not found or inactive");
                    return (null, "Invalid credentials");
                }

                // Verify password using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    _logger.LogWarning("Authentication failed for email {Email}: Invalid password.", email);
                    activity?.SetStatus(ActivityStatusCode.Error, "Invalid password");
                    return (null, "Invalid credentials");
                }

                user.LastLoginAt = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                activity?.SetStatus(ActivityStatusCode.Ok);
                return (user, null); // Authentication successful
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for email {Email}", email);
                activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
                return (null, "An error occurred during authentication.");
            }
        }

        public string GenerateToken(User user)
        {
            using var activity = ActivitySource.StartActivity("GenerateToken");
            activity?.SetTag("user.id", user.Id.ToString());

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured."));
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserType.ToString()),
                    new Claim("TenantId", user.TenantId.ToString()),
                    // Add system admin claim if user belongs to admin tenant
                    user.TenantId == Shared.Data.ApplicationDbContext.AdminTenantId ? new Claim("IsSystemAdmin", "true") : null
                }.Where(c => c != null)),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:AccessTokenValidityInMinutes"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            activity?.SetStatus(ActivityStatusCode.Ok);
            return tokenHandler.WriteToken(token);
        }

        public async Task<RefreshToken> GenerateRefreshToken(User user, string ipAddress)
        {
            using var activity = ActivitySource.StartActivity("GenerateRefreshToken");
            activity?.SetTag("user.id", user.Id.ToString());

            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64)),
                Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:RefreshTokenValidityInDays"])),
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress,
                UserId = user.Id
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            activity?.SetStatus(ActivityStatusCode.Ok);
            return refreshToken;
        }

        public async Task<RefreshToken?> GetRefreshToken(string token)
        {
            return await _context.RefreshTokens.Include(rt => rt.User).FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<bool> ValidateRefreshToken(string refreshTokenValue)
        {
            using var activity = ActivitySource.StartActivity("ValidateRefreshToken");
            activity?.SetTag("refreshToken", refreshTokenValue);

            var refreshToken = await GetRefreshToken(refreshTokenValue);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                activity?.SetStatus(ActivityStatusCode.Error, "Invalid or inactive refresh token.");
                return false;
            }

            activity?.SetStatus(ActivityStatusCode.Ok);
            return true;
        }

        public async Task<User?> GetUserFromRefreshToken(string refreshTokenValue)
        {
            using var activity = ActivitySource.StartActivity("GetUserFromRefreshToken");
            activity?.SetTag("refreshToken", refreshTokenValue);

            var refreshToken = await GetRefreshToken(refreshTokenValue);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                activity?.SetStatus(ActivityStatusCode.Error, "Invalid or inactive refresh token.");
                return null;
            }

            activity?.SetStatus(ActivityStatusCode.Ok);
            return refreshToken.User;
        }

        public async Task<bool> InvalidateRefreshToken(string refreshTokenValue, string ipAddress)
        {
            using var activity = ActivitySource.StartActivity("InvalidateRefreshToken");
            activity?.SetTag("refreshToken", refreshTokenValue);

            var refreshToken = await GetRefreshToken(refreshTokenValue);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                activity?.SetStatus(ActivityStatusCode.Error, "Invalid or inactive refresh token.");
                return false;
            }

            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();

            activity?.SetStatus(ActivityStatusCode.Ok);
            return true;
        }

        public bool ValidateJwtToken(string token)
        {
            using var activity = ActivitySource.StartActivity("ValidateJwtToken");
            
            if (string.IsNullOrEmpty(token))
                return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured."));
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero // Token expires exactly at expiration time
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                activity?.SetStatus(ActivityStatusCode.Ok);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JWT Token validation failed.");
                activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
                return false;
            }
        }

        public async Task<bool> ChangePassword(User user, string newPassword)
        {
            using var activity = ActivitySource.StartActivity("ChangePassword");
            activity?.SetTag("user.id", user?.Id.ToString());

            try
            {
                if (user == null || !user.IsActive)
                {
                    activity?.SetStatus(ActivityStatusCode.Error, "User is null or inactive.");
                    _logger.LogWarning("Attempted to change password for null or inactive user.");
                    return false;
                }

                // Invalidate all existing refresh tokens for the user upon password change
                var userRefreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.UserId == user.Id && rt.IsActive)
                    .ToListAsync();

                foreach (var token in userRefreshTokens)
                {
                    token.Revoked = DateTime.UtcNow;
                    token.RevokedByIp = "System (Password Change)"; // Or get actual IP if available
                    _context.RefreshTokens.Update(token);
                }
                await _context.SaveChangesAsync();

                return await _userService.UpdatePassword(user, newPassword);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", user?.Id);
                activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
                return false;
            }
        }
    }
}