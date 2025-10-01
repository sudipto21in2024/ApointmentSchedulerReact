using System.ComponentModel.DataAnnotations;
using Shared.Models;

namespace Shared.DTOs
{
    public class UpdatePricingPlanStatusRequest
    {
        [Required]
        public PricingPlanStatus Status { get; set; }
    }
}