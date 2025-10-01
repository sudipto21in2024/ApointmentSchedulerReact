using System;
using System.Collections.Generic;

namespace Shared.Models
{
    public class PricingPlan
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Interval { get; set; } = string.Empty; // e.g., "monthly", "annually"
        public List<string> Features { get; set; } = new List<string>();
        public int MaxUsers { get; set; }
        public int MaxAppointments { get; set; }
        public PricingPlanStatus Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}