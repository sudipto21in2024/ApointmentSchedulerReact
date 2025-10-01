// using Shared.Models;
// using UserService.Processors;
// using Microsoft.Extensions.Configuration;
// using BCrypt.Net;
// using Shared.Contracts;
// using Microsoft.Extensions.Logging;
// using System.Threading.Tasks;

// namespace UserService.Services
// {
//     public class AuthenticationService : Shared.Contracts.IAuthenticationService
//     {
//         private readonly IJwtService _jwtService;
//         private readonly ITokenService _tokenService;
//         private readonly IUserService _userService;
//         private readonly IConfiguration _configuration;
//         private readonly ILogger<AuthenticationService> _logger;

//         public AuthenticationService(
//             IJwtService jwtService,
//             ITokenService tokenService,
//             IUserService userService,
//             IConfiguration configuration,
//             ILogger<AuthenticationService> logger
//             )
//         {
//             _jwtService = jwtService;
//             _tokenService = tokenService;
//             _userService = userService;
//             _configuration = configuration;
//             _logger = logger;
//         }

//         public async Task<(Shared.Models.User?, string?)> Authenticate(string username, string password)
//         {
//             var user = await _userService.GetUserByUsername(username);
//             if (user == null)
//             {
//                 _logger.LogInformation($"Authentication failed for username: {username}. User not found.");
//                 return (null, "Invalid username or password.");
//             }

//             if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
//             {
//                 _logger.LogInformation($"Authentication failed for username: {username}. Invalid password.");
//                 return (null, "Invalid username or password.");
//             }

//             return (user, null);
//         }

//         public async Task<string> GenerateToken(Shared.Models.User user)
//         {
//             return _jwtService.GenerateToken(user);
//         }

//         public async Task<string> GenerateRefreshToken(Shared.Models.User user)
//         {
//             return _tokenService.GenerateRefreshToken(user);
//         }

//         public async Task<bool> ValidateRefreshToken(string refreshToken)
//         {
//             return _tokenService.ValidateRefreshToken(refreshToken);
//         }

//         public async Task<Shared.Models.User?> GetUserFromRefreshToken(string refreshToken)
//         {
//             return await _tokenService.GetUserFromRefreshToken(refreshToken);
//         }

//         public async Task<bool> InvalidateRefreshToken(string refreshToken)
//         {
//             return await _tokenService.InvalidateRefreshToken(refreshToken);
//         }

//          public async Task<bool> ChangePassword(Shared.Models.User user, string newPassword)
//         {
//            // Implement password security requirements here
//            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
//             return await _userService.UpdatePassword(user, hashedPassword);
//         }
//     }
// }