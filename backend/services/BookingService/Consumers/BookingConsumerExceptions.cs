using System;

namespace BookingService.Consumers
{
    /// <summary>
    /// Exception thrown when event data validation fails
    /// </summary>
    public class EventValidationException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the EventValidationException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public EventValidationException(string message) : base(message) { }
        
        /// <summary>
        /// Initializes a new instance of the EventValidationException class
        /// </summary>
        /// <param name="message">The exception message</param>
        /// <param name="innerException">The inner exception</param>
        public EventValidationException(string message, Exception innerException) : base(message, innerException) { }
    }
    
    /// <summary>
    /// Exception thrown when payment processing fails
    /// </summary>
    public class PaymentProcessingException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the PaymentProcessingException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public PaymentProcessingException(string message) : base(message) { }
        
        /// <summary>
        /// Initializes a new instance of the PaymentProcessingException class
        /// </summary>
        /// <param name="message">The exception message</param>
        /// <param name="innerException">The inner exception</param>
        public PaymentProcessingException(string message, Exception innerException) : base(message, innerException) { }
    }
    
    /// <summary>
    /// Exception thrown when notification sending fails
    /// </summary>
    public class NotificationSendingException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the NotificationSendingException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public NotificationSendingException(string message) : base(message) { }
        
        /// <summary>
        /// Initializes a new instance of the NotificationSendingException class
        /// </summary>
        /// <param name="message">The exception message</param>
        /// <param name="innerException">The inner exception</param>
        public NotificationSendingException(string message, Exception innerException) : base(message, innerException) { }
    }
    
    /// <summary>
    /// Exception thrown when booking update fails
    /// </summary>
    public class BookingUpdateException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the BookingUpdateException class
        /// </summary>
        /// <param name="message">The exception message</param>
        public BookingUpdateException(string message) : base(message) { }
        
        /// <summary>
        /// Initializes a new instance of the BookingUpdateException class
        /// </summary>
        /// <param name="message">The exception message</param>
        /// <param name="innerException">The inner exception</param>
        public BookingUpdateException(string message, Exception innerException) : base(message, innerException) { }
    }
}