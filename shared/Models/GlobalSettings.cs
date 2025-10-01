using System;

namespace Shared.Models
{
    public class GlobalSettings
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool MaintenanceMode { get; set; }
        public string DefaultTimezone { get; set; } = "UTC";
        public int MaxUsersPerTenant { get; set; } = 100;
        public int MaxAppointmentsPerTenant { get; set; } = 1000;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid? UpdatedBy { get; set; } // User who last updated
    }
}