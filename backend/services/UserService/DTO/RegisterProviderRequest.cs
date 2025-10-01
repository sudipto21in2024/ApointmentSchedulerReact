using System;
using System.ComponentModel.DataAnnotations;

namespace UserService.DTO
{
    public class RegisterProviderRequest
    {
        // User Information
        [Required]
        public string FirstName { get; set; } = null!;
        
        [Required]
        public string LastName { get; set; } = null!;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = null!;
        
        public string? PhoneNumber { get; set; }

        // Tenant Information
        [Required]
        public Guid TenantId { get; set; }
        
        public string? Description { get; set; }
        
        [EmailAddress]
        public string? ContactEmail { get; set; }
        
        public string? LogoUrl { get; set; }

        // Subscription Information
        [Required]
        public Guid PricingPlanId { get; set; }
        
        // Payment Information (optional for free plans)
        public string? PaymentMethod { get; set; }
        public string? CardToken { get; set; } // Tokenized card information from payment gateway
        
        // Helper method to determine if this is a paid plan registration
        public bool IsPaidPlanRegistration()
        {
            // For now, we'll assume any registration with payment information is for a paid plan
            // In a real implementation, we would check the pricing plan details
            return !string.IsNullOrEmpty(PaymentMethod) && !string.IsNullOrEmpty(CardToken);
        }
    }
}