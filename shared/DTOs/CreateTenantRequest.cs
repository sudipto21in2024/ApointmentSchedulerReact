using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class CreateTenantRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = null!;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(100)]
        public string Subdomain { get; set; } = null!;

        [StringLength(500)]
        public string? LogoUrl { get; set; }

        [Required]
        [EmailAddress]
        public string AdminEmail { get; set; } = null!;
    }
}