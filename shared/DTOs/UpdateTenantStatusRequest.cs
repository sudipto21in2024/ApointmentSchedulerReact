using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace Shared.DTOs
{
    public class UpdateTenantStatusRequest
    {
        [Required]
        public TenantStatus Status { get; set; }
    }
}