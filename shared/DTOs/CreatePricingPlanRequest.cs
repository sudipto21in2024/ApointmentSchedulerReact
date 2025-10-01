using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace Shared.DTOs
{
    public class CreatePricingPlanRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = null!;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";

        [Required]
        [StringLength(20)]
        public string Interval { get; set; } = "monthly";

        public List<string> Features { get; set; } = new List<string>();

        [Range(1, int.MaxValue)]
        public int MaxUsers { get; set; } = 1;

        [Range(1, int.MaxValue)]
        public int MaxAppointments { get; set; } = 10;
    }
}