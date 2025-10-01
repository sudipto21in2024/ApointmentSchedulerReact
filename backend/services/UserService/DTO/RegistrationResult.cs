using System;
using Shared.Models;

namespace UserService.DTO
{
    public class RegistrationResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public User? User { get; set; }
        public Tenant? Tenant { get; set; }
        public Shared.DTOs.SubscriptionDto? Subscription { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
    }
}