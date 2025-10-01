using System;
using System.Collections.Generic;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for customer insights including booking history and feedback
    /// </summary>
    public class CustomerInsightsDto
    {
        public List<CustomerBookingHistoryDto> CustomerBookingHistory { get; set; } = new List<CustomerBookingHistoryDto>();
        public List<CustomerFeedbackDto> CustomerFeedback { get; set; } = new List<CustomerFeedbackDto>();
        public CustomerStatisticsDto Statistics { get; set; } = new CustomerStatisticsDto();
    }
    
    /// <summary>
    /// DTO for customer booking history
    /// </summary>
    public class CustomerBookingHistoryDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime LastBookingDate { get; set; }
        public List<BookingDetailDto> RecentBookings { get; set; } = new List<BookingDetailDto>();
    }
    
    /// <summary>
    /// DTO for customer feedback and reviews
    /// </summary>
    public class CustomerFeedbackDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string ReviewTitle { get; set; } = string.Empty;
        public string ReviewComment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// DTO for customer statistics
    /// </summary>
    public class CustomerStatisticsDto
    {
        public int TotalCustomers { get; set; }
        public int NewCustomersThisMonth { get; set; }
        public double AverageBookingsPerCustomer { get; set; }
        public int MostActiveCustomerBookings { get; set; }
        public string MostActiveCustomerName { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// DTO for booking details
    /// </summary>
    public class BookingDetailDto
    {
        public Guid BookingId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}