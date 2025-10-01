using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for creating a service
    /// </summary>
    public class CreateServiceRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public int Duration { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public int MaxBookingsPerDay { get; set; } = 10;
    }
}