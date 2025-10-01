using System.ComponentModel.DataAnnotations;

namespace UserService.DTO
{
    public class ResetPasswordRequest
    {
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Token { get; set; } = null!;
        [Required]
        public string NewPassword { get; set; } = null!;
    }
}