using System;

namespace Shared.Events
{
    /// <summary>
    /// Event triggered when a new booking is created by a customer
    /// </summary>
    public class BookingCreatedEvent : IEvent
    {
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid SlotId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime BookingDate { get; set; }
        public DateTime SlotStartDateTime { get; set; }
        public DateTime SlotEndDateTime { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a booking is confirmed by the service provider
    /// </summary>
    public class BookingConfirmedEvent : IEvent
    {
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime BookingDate { get; set; }
        public DateTime SlotStartDateTime { get; set; }
        public DateTime SlotEndDateTime { get; set; }
        public DateTime ConfirmedAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a booking is cancelled by either the customer or provider
    /// </summary>
    public class BookingCancelledEvent : IEvent
    {
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public string CancellationReason { get; set; } = string.Empty;
        public bool IsCustomerCancelled { get; set; }
        public decimal RefundAmount { get; set; }
        public DateTime CancelledAt { get; set; }
    }

    /// <summary>
    /// Event triggered when a booking is rescheduled to a new time slot
    /// </summary>
    public class BookingRescheduledEvent : IEvent
    {
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime OldSlotStartDateTime { get; set; }
        public DateTime OldSlotEndDateTime { get; set; }
        public DateTime NewSlotStartDateTime { get; set; }
        public DateTime NewSlotEndDateTime { get; set; }
        public DateTime RescheduledAt { get; set; }
    }

    /// <summary>
    /// Event triggered to send reminders for upcoming bookings
    /// </summary>
    public class BookingReminderEvent : IEvent
    {
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid TenantId { get; set; }
        public DateTime SlotStartDateTime { get; set; }
        public DateTime SlotEndDateTime { get; set; }
        public int ReminderType { get; set; } // 1 = 24 hours, 2 = 1 hour, etc.
        public DateTime ReminderAt { get; set; }
    }
}