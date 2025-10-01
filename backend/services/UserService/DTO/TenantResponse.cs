using System;
using Shared.Models;

namespace UserService.DTO
{
    public class TenantResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Domain { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? LogoUrl { get; set; }
        public string? ContactEmail { get; set; }

        public TenantResponse(Tenant tenant)
        {
            Id = tenant.Id;
            Name = tenant.Name;
            Description = tenant.Description;
            Domain = tenant.Domain;
            IsActive = tenant.IsActive;
            CreatedAt = tenant.CreatedAt;
            UpdatedAt = tenant.UpdatedAt;
            LogoUrl = tenant.LogoUrl;
            ContactEmail = tenant.ContactEmail;
        }
    }
}