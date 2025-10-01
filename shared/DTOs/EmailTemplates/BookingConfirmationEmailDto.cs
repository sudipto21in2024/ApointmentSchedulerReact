using System;

namespace Shared.DTOs.EmailTemplates
{
    public class BookingConfirmationEmailDto
    {
        public string CustomerName { get; set; } = null!;
        public string ServiceName { get; set; } = null!;
        public DateTime BookingDate { get; set; }
        public string BookingTime { get; set; } = null!; // Formatted time string
        public string ProviderName { get; set; } = null!;
    }
}