using System;
using System.ComponentModel.DataAnnotations;

namespace UserService.DTO
{
    public class UpdateTenantRequest
    {
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Tenant name must be between 3 and 100 characters.")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        [Url(ErrorMessage = "Invalid domain format.")]
        public string? Domain { get; set; }

        [EmailAddress(ErrorMessage = "Invalid contact email format.")]
        public string? ContactEmail { get; set; }

        [Url(ErrorMessage = "Invalid logo URL format.")]
        public string? LogoUrl { get; set; }

        public bool? IsActive { get; set; }
    }
}