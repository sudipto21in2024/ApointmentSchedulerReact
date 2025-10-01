using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace UserService.DTO
{
    public class RegisterRequest
    {
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
        [Required]
        public string FirstName { get; set; } = null!;
        [Required]
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        [Required]
        public Shared.Models.UserRole UserType { get; set; }
        public Guid TenantId { get; set; }
    }
}