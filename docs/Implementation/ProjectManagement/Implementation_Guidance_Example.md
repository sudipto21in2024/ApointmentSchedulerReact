# Implementation Guidance Example

This document demonstrates how to incorporate detailed method signatures and implementation logic in task breakdowns, following the enhanced PM AI Agent approach.

## Task: BE-005-02 - Implement Booking Service

### Implementation Guidance Document

#### 1. Method Signatures

##### Interface Definition
```csharp
// File: backend/services/BookingService/Services/IBookingService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Models;

namespace BookingService.Services
{
    public interface IBookingService
    {
        /// <summary>
        /// Creates a new booking with the specified details
        /// </summary>
        /// <param name="request">The booking creation request containing customer, service, and slot information</param>
        /// <returns>The created booking entity</returns>
        /// <exception cref="SlotNotAvailableException">Thrown when the requested slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Booking> CreateBookingAsync(CreateBookingRequest request);

        /// <summary>
        /// Retrieves a booking by its ID
        /// </summary>
        /// <param name="bookingId">The ID of the booking to retrieve</param>
        /// <returns>The booking entity if found, null otherwise</returns>
        Task<Booking> GetBookingByIdAsync(Guid bookingId);

        /// <summary>
        /// Updates an existing booking with new information
        /// </summary>
        /// <param name="bookingId">The ID of the booking to update</param>
        /// <param name="request">The update request containing new information</param>
        /// <returns>The updated booking entity</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when business rules are violated</exception>
        Task<Booking> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request);

        /// <summary>
        /// Cancels an existing booking
        /// </summary>
        /// <param name="bookingId">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation request containing reason and user information</param>
        /// <returns>The cancelled booking entity</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking is not found</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when cancellation rules are violated</exception>
        Task<Booking> CancelBookingAsync(Guid bookingId, CancelBookingRequest request);

        /// <summary>
        /// Confirms a booking after successful payment
        /// </summary>
        /// <param name="bookingId">The ID of the booking to confirm</param>
        /// <returns>The confirmed booking entity</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking is not found</exception>
        Task<Booking> ConfirmBookingAsync(Guid bookingId);

        /// <summary>
        /// Retrieves bookings based on filter criteria
        /// </summary>
        /// <param name="filter">The filter criteria for retrieving bookings</param>
        /// <returns>A collection of booking entities matching the filter</returns>
        Task<IEnumerable<Booking>> GetBookingsAsync(BookingFilter filter);

        /// <summary>
        /// Reschedules an existing booking to a new slot
        /// </summary>
        /// <param name="bookingId">The ID of the booking to reschedule</param>
        /// <param name="request">The reschedule request containing new slot information</param>
        /// <returns>The rescheduled booking entity</returns>
        /// <exception cref="EntityNotFoundException">Thrown when the booking is not found</exception>
        /// <exception cref="SlotNotAvailableException">Thrown when the new slot is not available</exception>
        /// <exception cref="BusinessRuleViolationException">Thrown when rescheduling rules are violated</exception>
        Task<Booking> RescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request);
    }
}
```

##### Implementation Class
```csharp
// File: backend/services/BookingService/Services/BookingService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.Models;
using BookingService.Exceptions;
using BookingService.Models;

namespace BookingService.Services
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISlotService _slotService;
        private readonly ILogger<BookingService> _logger;

        public BookingService(
            ApplicationDbContext context,
            ISlotService slotService,
            ILogger<BookingService> logger)
        {
            _context = context;
            _slotService = slotService;
            _logger = logger;
        }

        public async Task<Booking> CreateBookingAsync(CreateBookingRequest request)
        {
            // Implementation details provided in logic section
        }

        public async Task<Booking> GetBookingByIdAsync(Guid bookingId)
        {
            // Implementation details provided in logic section
        }

        public async Task<Booking> UpdateBookingAsync(Guid bookingId, UpdateBookingRequest request)
        {
            // Implementation details provided in logic section
        }

        public async Task<Booking> CancelBookingAsync(Guid bookingId, CancelBookingRequest request)
        {
            // Implementation details provided in logic section
        }

        public async Task<Booking> ConfirmBookingAsync(Guid bookingId)
        {
            // Implementation details provided in logic section
        }

        public async Task<IEnumerable<Booking>> GetBookingsAsync(BookingFilter filter)
        {
            // Implementation details provided in logic section
        }

        public async Task<Booking> RescheduleBookingAsync(Guid bookingId, RescheduleBookingRequest request)
        {
            // Implementation details provided in logic section
        }
    }
}
```

#### 2. Implementation Logic

##### CreateBookingAsync Method
```
Method: CreateBookingAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the CreateBookingRequest parameters
   - Check that CustomerId, ServiceId, and SlotId are not empty
   - Validate that BookingDate is not in the past
   - Ensure TenantId is provided

2. Check if the requested slot is available
   - Call _slotService.IsSlotAvailableAsync(slotId)
   - If slot is not available, throw SlotNotAvailableException

3. Check if customer already has a booking for this slot
   - Query database for existing booking with same CustomerId and SlotId
   - If found, throw BusinessRuleViolationException

4. Begin database transaction
   - Use _context.Database.BeginTransactionAsync()

5. Create new Booking entity with provided details
   - Set Id to new Guid
   - Set CustomerId, ServiceId, SlotId, TenantId from request
   - Set Status to "Pending"
   - Set BookingDate, CreatedAt, UpdatedAt to current UTC time
   - Set Notes from request if provided

6. Update slot availability
   - Decrement slot.AvailableBookings by 1
   - If AvailableBookings reaches 0, set IsAvailable to false
   - Update slot.UpdatedAt to current UTC time

7. Save changes to database
   - Call _context.SaveChangesAsync()

8. Commit transaction
   - Call transaction.CommitAsync()

9. Return created booking

10. Error handling
    - If any step fails, rollback transaction
    - Log error with appropriate severity
    - Throw appropriate exception (SlotNotAvailableException, BusinessRuleViolationException, etc.)
```

##### GetBookingByIdAsync Method
```
Method: GetBookingByIdAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the bookingId parameter
   - Check that bookingId is not empty

2. Query database for booking by ID
   - Use _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId)
   - Include related entities (Customer, Service, Slot)

3. Return booking if found, null otherwise

4. Error handling
   - Log any database errors
   - Re-throw exceptions for handling by caller
```

##### UpdateBookingAsync Method
```
Method: UpdateBookingAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the bookingId and request parameters
   - Check that bookingId is not empty
   - Validate request data

2. Retrieve existing booking
   - Call GetBookingByIdAsync(bookingId)
   - If booking not found, throw EntityNotFoundException

3. Validate business rules
   - Check that booking status allows updates
   - Validate new status if provided

4. Update booking properties
   - Update Status if provided in request
   - Update Notes if provided in request
   - Update UpdatedAt to current UTC time

5. Save changes to database
   - Call _context.SaveChangesAsync()

6. Return updated booking

7. Error handling
   - Log validation errors
   - Throw BusinessRuleViolationException for rule violations
   - Handle database errors appropriately
```

##### CancelBookingAsync Method
```
Method: CancelBookingAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the bookingId and request parameters
   - Check that bookingId is not empty
   - Validate request data (CancellationReason, CancelledBy)

2. Retrieve existing booking
   - Call GetBookingByIdAsync(bookingId)
   - If booking not found, throw EntityNotFoundException

3. Validate cancellation rules
   - Check that booking status allows cancellation (not already cancelled or completed)
   - Verify cancellation policy (time-based restrictions)
   - Validate that CancelledBy user has permission

4. Begin database transaction
   - Use _context.Database.BeginTransactionAsync()

5. Update booking status
   - Set Status to "Cancelled"
   - Set CancelledAt to current UTC time
   - Set CancelledBy to user from request
   - Update UpdatedAt to current UTC time

6. Update slot availability
   - Increment slot.AvailableBookings by 1
   - Set IsAvailable to true if not already true
   - Update slot.UpdatedAt to current UTC time

7. Process refund if applicable
   - Calculate refund amount based on cancellation policy
   - Create refund record if amount > 0

8. Save changes to database
   - Call _context.SaveChangesAsync()

9. Commit transaction
   - Call transaction.CommitAsync()

10. Return cancelled booking

11. Error handling
    - If any step fails, rollback transaction
    - Log error with appropriate severity
    - Throw appropriate exception (BusinessRuleViolationException, etc.)
```

##### ConfirmBookingAsync Method
```
Method: ConfirmBookingAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the bookingId parameter
   - Check that bookingId is not empty

2. Retrieve existing booking
   - Call GetBookingByIdAsync(bookingId)
   - If booking not found, throw EntityNotFoundException

3. Validate confirmation rules
   - Check that booking status is "Pending"
   - Verify that payment has been processed

4. Update booking status
   - Set Status to "Confirmed"
   - Update UpdatedAt to current UTC time

5. Save changes to database
   - Call _context.SaveChangesAsync()

6. Return confirmed booking

7. Error handling
   - Log validation errors
   - Throw BusinessRuleViolationException for rule violations
   - Handle database errors appropriately
```

##### GetBookingsAsync Method
```
Method: GetBookingsAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the filter parameter
   - Check filter criteria for validity

2. Build query based on filter criteria
   - Start with _context.Bookings.AsQueryable()
   - Apply filters for CustomerId, ServiceId, Status, date ranges, etc.
   - Include related entities as needed

3. Apply sorting and pagination
   - Order by specified field (default: CreatedAt descending)
   - Apply skip/take for pagination

4. Execute query
   - Call ToListAsync() to retrieve results

5. Return collection of bookings

6. Error handling
   - Log query errors
   - Handle database errors appropriately
```

##### RescheduleBookingAsync Method
```
Method: RescheduleBookingAsync
File: backend/services/BookingService/Services/BookingService.cs

Logic:
1. Validate the bookingId and request parameters
   - Check that bookingId is not empty
   - Validate that NewSlotId is provided

2. Retrieve existing booking
   - Call GetBookingByIdAsync(bookingId)
   - If booking not found, throw EntityNotFoundException

3. Validate rescheduling rules
   - Check that booking status allows rescheduling
   - Verify that booking is not in the past
   - Validate user permissions

4. Check new slot availability
   - Call _slotService.IsSlotAvailableAsync(NewSlotId)
   - If slot is not available, throw SlotNotAvailableException

5. Begin database transaction
   - Use _context.Database.BeginTransactionAsync()

6. Update booking with new slot
   - Set SlotId to NewSlotId
   - Update UpdatedAt to current UTC time

7. Update slot availability
   - Decrement new slot.AvailableBookings by 1
   - If AvailableBookings reaches 0, set IsAvailable to false
   - Update new slot.UpdatedAt to current UTC time
   - Increment old slot.AvailableBookings by 1
   - Update old slot.UpdatedAt to current UTC time

8. Save changes to database
   - Call _context.SaveChangesAsync()

9. Commit transaction
   - Call transaction.CommitAsync()

10. Return rescheduled booking

11. Error handling
    - If any step fails, rollback transaction
    - Log error with appropriate severity
    - Throw appropriate exception (SlotNotAvailableException, BusinessRuleViolationException, etc.)
```

#### 3. File Structure

```
File Structure:
- backend/services/BookingService/Services/IBookingService.cs
- backend/services/BookingService/Services/BookingService.cs
- backend/services/BookingService/Models/CreateBookingRequest.cs
- backend/services/BookingService/Models/UpdateBookingRequest.cs
- backend/services/BookingService/Models/CancelBookingRequest.cs
- backend/services/BookingService/Models/RescheduleBookingRequest.cs
- backend/services/BookingService/Models/BookingFilter.cs
- backend/services/BookingService/Exceptions/SlotNotAvailableException.cs
- backend/services/BookingService/Exceptions/BusinessRuleViolationException.cs
- backend/services/BookingService/Exceptions/EntityNotFoundException.cs
```

#### 4. Dependencies

```
Dependencies:
- Microsoft.EntityFrameworkCore (for data access)
- Microsoft.Extensions.Logging (for logging)
- Shared.Data (ApplicationDbContext)
- Shared.Models (Booking, Slot, Service entities)
- BookingService.Services.ISlotService (slot availability checking)
- System.Collections.Generic (IEnumerable)
- System.Threading.Tasks (Task)
```

#### 5. Error Handling

```
Error Handling:
- SlotNotAvailableException: When slot is not available for booking or rescheduling
- BusinessRuleViolationException: When business rules are violated (cancellation policy, status rules, etc.)
- EntityNotFoundException: When requested booking is not found
- DbUpdateException: When database operations fail
- ValidationException: When request data is invalid
- All exceptions should be logged with appropriate severity
- Transactions should be rolled back on errors
```

#### 6. Testing Guidance

```
Testing Guidance:

Unit Tests:
- CreateBookingAsync_WithValidRequest_CreatesBooking
- CreateBookingAsync_WithUnavailableSlot_ThrowsSlotNotAvailableException
- CreateBookingAsync_WithExistingBooking_ThrowsBusinessRuleViolationException
- CreateBookingAsync_WithInvalidRequest_ThrowsValidationException
- GetBookingByIdAsync_WithValidId_ReturnsBooking
- GetBookingByIdAsync_WithInvalidId_ReturnsNull
- UpdateBookingAsync_WithValidRequest_UpdatesBooking
- UpdateBookingAsync_WithInvalidBookingId_ThrowsEntityNotFoundException
- CancelBookingAsync_WithValidRequest_CancelsBooking
- CancelBookingAsync_WithInvalidBookingId_ThrowsEntityNotFoundException
- CancelBookingAsync_WithAlreadyCancelledBooking_ThrowsBusinessRuleViolationException
- ConfirmBookingAsync_WithValidRequest_ConfirmsBooking
- ConfirmBookingAsync_WithInvalidBookingId_ThrowsEntityNotFoundException
- GetBookingsAsync_WithFilter_ReturnsFilteredBookings
- RescheduleBookingAsync_WithValidRequest_ReschedulesBooking
- RescheduleBookingAsync_WithInvalidBookingId_ThrowsEntityNotFoundException
- RescheduleBookingAsync_WithUnavailableSlot_ThrowsSlotNotAvailableException

Integration Tests:
- CreateBooking_Endpoint_WithValidData_ReturnsCreatedBooking
- CreateBooking_Endpoint_WithInvalidSlot_ReturnsConflict
- GetBooking_Endpoint_WithValidId_ReturnsBooking
- UpdateBooking_Endpoint_WithValidData_UpdatesBooking
- CancelBooking_Endpoint_WithValidData_CancelsBooking
- ConfirmBooking_Endpoint_WithValidData_ConfirmsBooking

Test Data Setup:
- Create test customers, services, and slots
- Set up slot availability scenarios
- Create bookings with different statuses
- Configure cancellation policies
```

This implementation guidance document provides detailed information for developers to implement the BookingService class with all its methods, including method signatures, implementation logic, file structure, dependencies, error handling, and testing guidance.