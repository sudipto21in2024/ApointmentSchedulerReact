using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class UpdateSubscriptionDto
    {
        [Required]
        public Guid PricingPlanId { get; set; }
    }
}