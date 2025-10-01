using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for updating a service
    /// </summary>
    public class UpdateServiceRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? CategoryId { get; set; }
        public int? Duration { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsFeatured { get; set; }
        public int? MaxBookingsPerDay { get; set; }
    }
}