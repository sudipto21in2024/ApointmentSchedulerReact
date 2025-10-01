using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class UpdateGlobalSettingsRequest
    {
        [Required]
        public bool MaintenanceMode { get; set; }

        [Required]
        [StringLength(100)]
        public string DefaultTimezone { get; set; } = null!;

        [Required]
        [Range(1, int.MaxValue)]
        public int MaxUsersPerTenant { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int MaxAppointmentsPerTenant { get; set; }
    }
}