using Shared.Models;

namespace UserService.DTO
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = null!;
        public Shared.Models.User User { get; set; } = null!;
    }
}