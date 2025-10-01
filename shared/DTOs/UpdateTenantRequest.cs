using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace Shared.DTOs
{
    public class UpdateTenantRequest
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? Subdomain { get; set; }

        [StringLength(500)]
        public string? LogoUrl { get; set; }

        [EmailAddress]
        public string? AdminEmail { get; set; }

        public TenantStatus? Status { get; set; }
    }
}