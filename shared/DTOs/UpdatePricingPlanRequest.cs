using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace Shared.DTOs
{
    public class UpdatePricingPlanRequest
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }

        [StringLength(3, MinimumLength = 3)]
        public string? Currency { get; set; }

        [StringLength(20)]
        public string? Interval { get; set; }

        public List<string>? Features { get; set; }

        [Range(1, int.MaxValue)]
        public int? MaxUsers { get; set; }

        [Range(1, int.MaxValue)]
        public int? MaxAppointments { get; set; }
    }
}