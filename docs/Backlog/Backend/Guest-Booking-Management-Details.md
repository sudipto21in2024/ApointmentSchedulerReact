# Gap Analysis: Guest Booking Management Details

## 1. Identified Gap

The Business Requirements Document (BRD) explicitly states [`FR-6.3`](docs/BusinessRequirements/BRD.mmd:130): "Allow bookings without registration (with email confirmation)." However, neither the High-Level Design (HLD) nor the Low-Level Design (LLD) documents provide sufficient detail on the management of these guest bookings, particularly regarding how guests can modify, cancel, or track their appointments without a registered user account.

## 2. Impact

*   **Poor User Experience:** Guests may find it difficult or impossible to manage their bookings, leading to frustration, increased support requests, and a negative perception of the platform.
*   **Operational Burden:** Customer support teams will be burdened with manual requests for booking modifications, cancellations, or inquiries from guest users.
*   **Data Inconsistency:** Without a clear mechanism for guest booking management, there's a risk of data inconsistencies if changes are made outside the system's intended flow.
*   **Reduced Conversion:** A cumbersome guest experience might discourage guest users from converting to registered accounts, impacting user acquisition goals.
*   **Security Concerns:** Improperly implemented guest management could lead to unauthorized access or manipulation of guest bookings.

## 3. Detailed Analysis

The BRD's requirement for guest bookings is a valuable feature for user convenience, reducing friction in the booking process. The acceptance criteria for [`FR-6.3`](docs/BusinessRequirements/BRD.mmd:130) include "Guest booking option," "Email confirmation sent," and "Ability to register later."

The HLD and LLD, while detailing the Booking Service and Notification Service, do not elaborate on how guest bookings are specifically handled post-confirmation. For registered users, account management features like [`FR-7.1`](docs/BusinessRequirements/BRD.mmd:134) ("View past and upcoming appointments") and [`FR-7.3`](docs/BusinessRequirements/BRD.mmd:137) ("Modify existing bookings subject to availability") are well-defined. The absence of similar, explicit mechanisms for guest users constitutes a significant gap.

Key questions that need to be addressed:
*   How does a guest user access their booking details after the initial confirmation?
*   What is the mechanism for a guest user to modify or cancel their booking? Is it via a unique link in the confirmation email, a specific guest portal, or through customer support?
*   How are these guest actions authenticated or verified to prevent unauthorized changes?
*   What happens if a guest user later decides to register? How are their existing guest bookings associated with their new registered account?
*   Are there any limitations or differences in functionality for guest bookings compared to registered user bookings?

## 4. Proposed Solution

Design and implement a secure and user-friendly mechanism for guest booking management, ensuring consistency with the overall platform experience.

### 4.1 High-Level Design Updates

*   Add a new flow in the HLD's "Data Flow Overview" specifically for "Guest Booking Management."
*   Specify that the Booking Service will handle guest booking modifications and cancellations.
*   The Notification Service will be crucial for sending unique, secure links for guest access.

### 4.2 Low-Level Design Updates

*   **Unique Booking Management Link:**
    *   Upon guest booking confirmation, generate a unique, cryptographically secure, and time-limited token or hash.
    *   Embed this token into a unique "Manage My Booking" link sent to the guest's confirmed email address via the Notification Service.
    *   This link will direct the guest to a dedicated, stateless page (or a PWA route) where they can view, modify, or cancel their specific booking.

*   **Dedicated Guest Booking API Endpoints:**
    *   In the Booking Service, create specific API endpoints (e.g., `/api/guest-bookings/{bookingToken}/details`, `/api/guest-bookings/{bookingToken}/modify`, `/api/guest-bookings/{bookingToken}/cancel`).
    *   These endpoints must validate the provided `bookingToken` for authenticity and expiration before allowing any operations.

*   **Guest-to-Registered User Conversion:**
    *   Provide an option on the guest booking management page for the user to register an account.
    *   If a guest registers using the same email address as their guest booking, the system (likely the User Service, in coordination with the Booking Service) should automatically associate their past guest bookings with their new registered account. This might involve updating the `UserId` on the `Booking` entity.

*   **Security Considerations:**
    *   Ensure the generated booking tokens are sufficiently long and random to prevent brute-force attacks.
    *   Implement token expiration and single-use mechanisms for modification/cancellation links where appropriate.
    *   Rate limit access to guest booking endpoints.

*   **Frontend Implementation:**
    *   Develop a dedicated Angular component/route for guest booking management.
    *   This component will parse the booking token from the URL, call the guest booking APIs, and provide a user interface for viewing and modifying booking details.

## 5. Reference Documentation & Programming Information

### 5.1 `Booking` Entity Enhancement

The `Booking` entity might need a field to store the guest's email and a flag to indicate if it's a guest booking, or a nullable `UserId`.

```csharp
// shared/Models/Booking.cs (Example)
public class Booking : BaseTenantEntity
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Guid? UserId { get; set; } // Nullable for guest bookings
    public string GuestEmail { get; set; } // Store guest email
    public string GuestName { get; set; } // Store guest name
    public string Status { get; set; } // e.g., "Confirmed", "Pending", "Cancelled", "NoShow"
    // ... other existing properties
}
```

### 5.2 Generating Secure Tokens (Example in C#)

```csharp
// Example in Booking Service or a dedicated TokenService
using System;
using System.Security.Cryptography;
using System.Text;

public static class BookingTokenGenerator
{
    public static string GenerateSecureToken()
    {
        // Generate a random byte array
        byte[] randomNumber = new byte[32]; // 32 bytes for a strong token
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }

        // Convert to base64 string for URL-safe representation
        return Convert.ToBase64String(randomNumber)
                      .Replace('+', '-') // Make URL safe
                      .Replace('/', '_')
                      .Replace('=', '\0'); // Remove padding
    }

    // In a real application, you'd store this token in the database with the booking
    // and validate it against the stored token.
}
```

### 5.3 Example Guest Booking API (Booking Service)

```csharp
// backend/services/BookingService/Controllers/GuestBookingsController.cs (Example)
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/guest-bookings")]
public class GuestBookingsController : ControllerBase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ILogger<GuestBookingsController> _logger;

    public GuestBookingsController(IBookingRepository bookingRepository, ILogger<GuestBookingsController> logger)
    {
        _bookingRepository = bookingRepository;
        _logger = logger;
    }

    [HttpGet("{token}")]
    public async Task<IActionResult> GetGuestBookingDetails(string token)
    {
        // In a real scenario, validate the token against a stored token associated with the booking
        // and check for expiration/single-use.
        // For simplicity, assume token is directly the Booking ID for now (NOT SECURE FOR PRODUCTION)
        if (!Guid.TryParse(token, out Guid bookingId))
        {
            return BadRequest("Invalid booking token format.");
        }

        var booking = await _bookingRepository.GetByIdAsync(bookingId); // Need to filter by TenantId if applicable
        if (booking == null || booking.UserId != null) // Ensure it's a guest booking
        {
            return NotFound("Booking not found or not a guest booking.");
        }

        // Return a DTO, not the full entity
        return Ok(new { booking.Id, booking.ServiceId, booking.BookingDate, booking.GuestName, booking.Status });
    }

    [HttpPost("{token}/cancel")]
    public async Task<IActionResult> CancelGuestBooking(string token)
    {
        // Similar token validation as above
        if (!Guid.TryParse(token, out Guid bookingId))
        {
            return BadRequest("Invalid booking token format.");
        }

        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.UserId != null || booking.Status == "Cancelled")
        {
            return NotFound("Booking not found, not a guest booking, or already cancelled.");
        }

        // Apply cancellation logic (e.g., update status, trigger refund if applicable)
        booking.Status = "Cancelled";
        await _bookingRepository.UpdateAsync(booking);

        _logger.LogInformation("Guest booking {BookingId} cancelled via token.", booking.Id);

        // Trigger notification for cancellation confirmation
        // _notificationService.Publish(new GuestBookingCancelledEvent { BookingId = booking.Id, GuestEmail = booking.GuestEmail });

        return Ok("Booking cancelled successfully.");
    }

    // Similar endpoints for modification
}
```

### 5.4 Key Considerations

*   **Token Security:** The generated tokens must be highly secure, unique, and ideally single-use or time-limited to prevent unauthorized access. They should be stored securely (e.g., hashed) in the database.
*   **Email Verification:** The "Manage My Booking" link should only be sent to the email address used for the guest booking.
*   **User Interface:** The frontend must provide a clear and intuitive interface for guests to manage their bookings using these links.
*   **Error Handling:** Clear error messages should be provided if a token is invalid, expired, or the booking is not found.
*   **Audit Trail:** All actions performed via guest links should be logged for auditing purposes.