using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs
{
    public class CreateSubscriptionDto
    {
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public Guid PricingPlanId { get; set; }
    }
}