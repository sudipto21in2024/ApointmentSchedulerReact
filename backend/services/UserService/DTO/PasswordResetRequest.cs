using System.ComponentModel.DataAnnotations;

namespace UserService.DTO
{
    public class PasswordResetRequest
    {
        [Required]
        public string Email { get; set; } = null!;
    }
}