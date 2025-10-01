using System.ComponentModel.DataAnnotations;

namespace UserService.DTO
{
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
    }
}