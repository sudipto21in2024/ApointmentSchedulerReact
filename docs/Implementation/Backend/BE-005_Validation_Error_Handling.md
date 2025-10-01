# BE-005: Validation and Error Handling Strategies

## Overview

This document outlines the validation and error handling strategies for the booking system implementation. Proper validation and error handling are crucial for maintaining data integrity, providing good user experience, and ensuring system reliability.

## Validation Strategy

### 1. Layered Validation Approach

Validation will be implemented at multiple layers:

1. **API Layer**: Initial request validation
2. **Service Layer**: Business rule validation
3. **Data Layer**: Database constraint validation

### 2. API Layer Validation

Using FluentValidation for request validation:

#### CreateBookingRequestValidator
```csharp
public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required");

        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithMessage("Service ID is required");

        RuleFor(x => x.SlotId)
            .NotEmpty()
            .WithMessage("Slot ID is required");

        RuleFor(x => x.TenantId)
            .NotEmpty()
            .WithMessage("Tenant ID is required");

        RuleFor(x => x.BookingDate)
            .NotEmpty()
            .WithMessage("Booking date is required")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Booking date cannot be in the future");
    }
}
```

#### UpdateBookingRequestValidator
```csharp
public class UpdateBookingRequestValidator : AbstractValidator<UpdateBookingRequest>
{
    public UpdateBookingRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(status => status == null || 
                new[] { "Pending", "Confirmed", "Cancelled", "Completed" }.Contains(status))
            .WithMessage("Invalid booking status");

        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .WithMessage("Notes cannot exceed 1000 characters");
    }
}
```

#### CancelBookingRequestValidator
```csharp
public class CancelBookingRequestValidator : AbstractValidator<CancelBookingRequest>
{
    public CancelBookingRequestValidator()
    {
        RuleFor(x => x.CancellationReason)
            .NotEmpty()
            .WithMessage("Cancellation reason is required")
            .MaximumLength(500)
            .WithMessage("Cancellation reason cannot exceed 500 characters");

        RuleFor(x => x.CancelledBy)
            .NotEmpty()
            .WithMessage("Cancelled by user ID is required");
    }
}
```

### 3. Service Layer Validation

Business rule validation in service methods:

#### Booking Validation
```csharp
public class BookingValidator : IBookingValidator
{
    private readonly ISlotService _slotService;
    private readonly IBookingService _bookingService;

    public async Task ValidateCreateBookingRequestAsync(CreateBookingRequest request)
    {
        // Validate slot availability
        if (!await _slotService.IsSlotAvailableAsync(request.SlotId))
        {
            throw new SlotNotAvailableException($"Slot {request.SlotId} is not available");
        }

        // Validate customer doesn't already have a booking for this slot
        var existingBooking = await _bookingService.GetBookingByCustomerAndSlotAsync(
            request.CustomerId, request.SlotId);
        if (existingBooking != null)
        {
            throw new BusinessRuleViolationException(
                "Customer already has a booking for this slot");
        }

        // Validate booking date is within service availability
        var slot = await _slotService.GetSlotByIdAsync(request.SlotId);
        if (request.BookingDate < slot.StartDateTime || request.BookingDate > slot.EndDateTime)
        {
            throw new BusinessRuleViolationException(
                "Booking date must be within the slot time range");
        }
    }

    public async Task ValidateCancelBookingRequestAsync(Guid bookingId, CancelBookingRequest request)
    {
        var booking = await _bookingService.GetBookingByIdAsync(bookingId);
        
        // Validate booking exists
        if (booking == null)
        {
            throw new EntityNotFoundException($"Booking {bookingId} not found");
        }

        // Validate booking status allows cancellation
        if (booking.Status == "Cancelled" || booking.Status == "Completed")
        {
            throw new BusinessRuleViolationException(
                $"Cannot cancel booking with status {booking.Status}");
        }

        // Validate cancellation policy (e.g., within 24 hours)
        var service = await _serviceService.GetServiceByIdAsync(booking.ServiceId);
        var cancellationPolicyHours = service.CancellationPolicyHours;
        if (DateTime.UtcNow > booking.Slot.StartDateTime.AddHours(-cancellationPolicyHours))
        {
            throw new BusinessRuleViolationException(
                "Cancellation period has expired for this booking");
        }
    }
}
```

#### Slot Validation
```csharp
public class SlotValidator : ISlotValidator
{
    public async Task ValidateSlotAvailabilityAsync(Guid slotId)
    {
        var slot = await _context.Slots
            .FirstOrDefaultAsync(s => s.Id == slotId && s.IsAvailable);
        
        if (slot == null)
        {
            throw new SlotNotAvailableException($"Slot {slotId} is not available");
        }
    }

    public async Task ValidateSlotCapacityAsync(Guid slotId, int requestedBookings)
    {
        var slot = await _context.Slots.FirstOrDefaultAsync(s => s.Id == slotId);
        
        if (slot == null)
        {
            throw new EntityNotFoundException($"Slot {slotId} not found");
        }

        if (slot.AvailableBookings < requestedBookings)
        {
            throw new SlotNotAvailableException(
                $"Slot only has {slot.AvailableBookings} available bookings, {requestedBookings} requested");
        }
    }
}
```

## Error Handling Strategy

### 1. Custom Exception Types

Define specific exception types for different error scenarios:

#### BusinessRuleViolationException
```csharp
public class BusinessRuleViolationException : Exception
{
    public BusinessRuleViolationException(string message) : base(message) { }
    
    public BusinessRuleViolationException(string message, Exception innerException) 
        : base(message, innerException) { }
}
```

#### SlotNotAvailableException
```csharp
public class SlotNotAvailableException : Exception
{
    public SlotNotAvailableException(string message) : base(message) { }
    
    public SlotNotAvailableException(string message, Exception innerException) 
        : base(message, innerException) { }
}
```

#### PaymentProcessingException
```csharp
public class PaymentProcessingException : Exception
{
    public PaymentProcessingException(string message) : base(message) { }
    
    public PaymentProcessingException(string message, Exception innerException) 
        : base(message, innerException) { }
}
```

#### EntityNotFoundException
```csharp
public class EntityNotFoundException : Exception
{
    public EntityNotFoundException(string message) : base(message) { }
    
    public EntityNotFoundException(string message, Exception innerException) 
        : base(message, innerException) { }
}
```

### 2. Global Exception Handling

Implement middleware for global exception handling:

#### ExceptionHandlingMiddleware
```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Timestamp = DateTime.UtcNow,
            Path = context.Request.Path
        };

        switch (exception)
        {
            case ValidationException validationException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "Validation error occurred";
                response.Details = validationException.Errors.Select(e => new ErrorDetail
                {
                    Property = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();
                break;

            case BusinessRuleViolationException businessRuleException:
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "Business rule violation";
                response.Details = new List<ErrorDetail>
                {
                    new ErrorDetail
                    {
                        Message = businessRuleException.Message
                    }
                };
                break;

            case EntityNotFoundException entityNotFoundException:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "Entity not found";
                response.Details = new List<ErrorDetail>
                {
                    new ErrorDetail
                    {
                        Message = entityNotFoundException.Message
                    }
                };
                break;

            case SlotNotAvailableException slotNotAvailableException:
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "Slot not available";
                response.Details = new List<ErrorDetail>
                {
                    new ErrorDetail
                    {
                        Message = slotNotAvailableException.Message
                    }
                };
                break;

            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "An unexpected error occurred";
                response.Details = new List<ErrorDetail>
                {
                    new ErrorDetail
                    {
                        Message = "Please try again later"
                    }
                };
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}
```

#### ErrorResponse Models
```csharp
public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }
    public string Path { get; set; }
    public List<ErrorDetail> Details { get; set; } = new List<ErrorDetail>();
}

public class ErrorDetail
{
    public string Property { get; set; }
    public string Message { get; set; }
}
```

### 3. Controller-Level Error Handling

Handle specific exceptions at the controller level:

#### BookingController Error Handling
```csharp
[ApiController]
[Route("[controller]")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IBookingValidator _bookingValidator;
    private readonly ILogger<BookingController> _logger;

    public BookingController(
        IBookingService bookingService,
        IBookingValidator bookingValidator,
        ILogger<BookingController> logger)
    {
        _bookingService = bookingService;
        _bookingValidator = bookingValidator;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            // Validate request
            await _bookingValidator.ValidateCreateBookingRequestAsync(request);
            
            // Create booking
            var booking = await _bookingService.CreateBookingAsync(request);
            
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, 
                new BookingResponse { Data = booking });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error occurred while creating booking");
            return BadRequest(new ErrorResponse
            {
                StatusCode = 400,
                Message = "Validation error occurred",
                Details = ex.Errors.Select(e => new ErrorDetail
                {
                    Property = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList()
            });
        }
        catch (BusinessRuleViolationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation while creating booking");
            return Conflict(new ErrorResponse
            {
                StatusCode = 409,
                Message = "Business rule violation",
                Details = new List<ErrorDetail>
                {
                    new ErrorDetail { Message = ex.Message }
                }
            });
        }
        catch (SlotNotAvailableException ex)
        {
            _logger.LogWarning(ex, "Slot not available while creating booking");
            return Conflict(new ErrorResponse
            {
                StatusCode = 409,
                Message = "Slot not available",
                Details = new List<ErrorDetail>
                {
                    new ErrorDetail { Message = ex.Message }
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating booking");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An unexpected error occurred",
                Details = new List<ErrorDetail>
                {
                    new ErrorDetail { Message = "Please try again later" }
                }
            });
        }
    }
}
```

## Database Error Handling

Handle database-specific errors:

```csharp
public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
{
    try
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        // ... implementation
        await transaction.CommitAsync();
        return booking;
    }
    catch (DbUpdateConcurrencyException ex)
    {
        await transaction.RollbackAsync();
        _logger.LogWarning(ex, "Concurrency conflict occurred while creating booking");
        throw new BusinessRuleViolationException("The booking data has been modified by another process");
    }
    catch (DbUpdateException ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Database error occurred while creating booking");
        
        // Handle specific database errors
        if (ex.InnerException?.Message.Contains("UNIQUE_CONSTRAINT") == true)
        {
            throw new BusinessRuleViolationException("A booking already exists for this slot and customer");
        }
        
        throw new BusinessRuleViolationException("A database error occurred while creating the booking");
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Event Processing Error Handling

Handle errors in event consumers:

```csharp
public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
{
    private readonly IBookingProcessor _bookingProcessor;
    private readonly ILogger<BookingCreatedConsumer> _logger;

    public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
    {
        var bookingEvent = context.Message;
        
        try
        {
            _logger.LogInformation("Processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
            
            // Process payment
            await _bookingProcessor.ProcessBookingPaymentAsync(bookingEvent);
            
            _logger.LogInformation("Completed processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
        }
        catch (PaymentProcessingException ex)
        {
            _logger.LogError(ex, "Payment processing failed for booking {BookingId}", bookingEvent.BookingId);
            
            // Publish payment failed event
            var paymentFailedEvent = new PaymentFailedEvent
            {
                BookingId = bookingEvent.BookingId,
                CustomerId = bookingEvent.CustomerId,
                ProviderId = bookingEvent.ProviderId,
                TenantId = bookingEvent.TenantId,
                Amount = bookingEvent.Price,
                Currency = bookingEvent.Currency,
                PaymentMethod = "CreditCard", // Default for now
                FailureReason = ex.Message,
                FailedAt = DateTime.UtcNow
            };
            
            await context.Publish(paymentFailedEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error processing BookingCreatedEvent for booking {BookingId}", bookingEvent.BookingId);
            
            // Re-throw to trigger retry mechanism
            throw;
        }
    }
}
```

## Retry and Circuit Breaker Patterns

Implement retry mechanisms for transient failures:

```csharp
public async Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request)
{
    var retryPolicy = Policy
        .Handle<PaymentProcessingException>()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
            onRetry: (exception, timespan, retryCount, context) =>
            {
                _logger.LogWarning(
                    exception,
                    "Payment processing failed. Retrying in {Timespan} (retry {RetryCount})",
                    timespan,
                    retryCount);
            });

    return await retryPolicy.ExecuteAsync(async () =>
    {
        // Payment processing logic
        try
        {
            // Call payment gateway
            var result = await _paymentGateway.ProcessPaymentAsync(request);
            return result;
        }
        catch (HttpRequestException ex)
        {
            throw new PaymentProcessingException("Payment gateway is temporarily unavailable", ex);
        }
        catch (Exception ex)
        {
            throw new PaymentProcessingException("Payment processing failed", ex);
        }
    });
}
```

## Logging Strategy

Implement structured logging for error tracking:

```csharp
public class BookingService : IBookingService
{
    private readonly ILogger<BookingService> _logger;

    public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
    {
        using var logScope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CustomerId"] = request.CustomerId,
            ["ServiceId"] = request.ServiceId,
            ["SlotId"] = request.SlotId
        });

        try
        {
            _logger.LogInformation("Creating booking for customer {CustomerId}", request.CustomerId);
            
            // Implementation
            
            _logger.LogInformation("Booking {BookingId} created successfully", booking.Id);
            return booking;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create booking for customer {CustomerId}", request.CustomerId);
            throw;
        }
    }
}
```

## Monitoring and Alerting

Set up monitoring for error patterns:

1. **Error Rate Metrics**: Track error rates by type
2. **Response Time Metrics**: Monitor response times
3. **Business Metric Alerts**: Alert on business rule violations
4. **Infrastructure Alerts**: Monitor database and service health

## Testing Error Handling

### Unit Tests for Validation
```csharp
public class BookingValidatorTests
{
    [Fact]
    public async Task ValidateCreateBookingRequestAsync_WithUnavailableSlot_ThrowsSlotNotAvailableException()
    {
        // Arrange
        var slotServiceMock = new Mock<ISlotService>();
        slotServiceMock.Setup(s => s.IsSlotAvailableAsync(It.IsAny<Guid>()))
            .ReturnsAsync(false);
        
        var validator = new BookingValidator(slotServiceMock.Object, /* other dependencies */);
        var request = new CreateBookingRequest { SlotId = Guid.NewGuid() };
        
        // Act & Assert
        await Assert.ThrowsAsync<SlotNotAvailableException>(
            () => validator.ValidateCreateBookingRequestAsync(request));
    }
}
```

### Integration Tests for Error Handling
```csharp
public class BookingControllerTests
{
    [Fact]
    public async Task CreateBooking_WithInvalidSlot_ReturnsConflict()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new CreateBookingRequest 
        { 
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid() // Invalid slot
        };
        
        // Act
        var response = await client.PostAsync("/bookings", 
            new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json"));
        
        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
```

This validation and error handling strategy ensures robust error management throughout the booking system while providing clear feedback to clients and maintaining system stability.