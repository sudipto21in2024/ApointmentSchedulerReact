# BE-005: Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the booking system implementation. The strategy covers unit tests, integration tests, and end-to-end tests to ensure the reliability, correctness, and performance of the system.

## Testing Pyramid

```
        ┌─────────┐
        │  E2E Tests      │  ← 10-20%
        ├─────────────────┤
        │Integration Tests│  ← 20-30%
        ├─────────────────┤
        │   Unit Tests    │  ← 70-80%
        └─────────────────┘
```

## Unit Testing Strategy

### 1. Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage for business-critical paths
- Test all edge cases and error conditions

### 2. Testing Framework
- xUnit.net as the testing framework
- Moq for mocking dependencies
- FluentAssertions for readable assertions

### 3. Service Layer Unit Tests

#### BookingService Tests
```csharp
public class BookingServiceTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<ISlotService> _slotServiceMock;
    private readonly BookingService _bookingService;

    public BookingServiceTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _slotServiceMock = new Mock<ISlotService>();
        _bookingService = new BookingService(_contextMock.Object, _slotServiceMock.Object);
    }

    [Fact]
    public async Task CreateBookingAsync_WithValidRequest_CreatesBooking()
    {
        // Arrange
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        _slotServiceMock.Setup(s => s.IsSlotAvailableAsync(request.SlotId))
            .ReturnsAsync(true);

        var slots = new List<Slot> { new Slot { Id = request.SlotId, AvailableBookings = 1 } }.AsQueryable();
        var slotsMock = new Mock<DbSet<Slot>>();
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Provider).Returns(slots.Provider);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Expression).Returns(slots.Expression);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.ElementType).Returns(slots.ElementType);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.GetEnumerator()).Returns(slots.GetEnumerator());

        _contextMock.Setup(c => c.Slots).Returns(slotsMock.Object);
        _contextMock.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

        // Act
        var result = await _bookingService.CreateBookingAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(request.CustomerId, result.CustomerId);
        Assert.Equal("Pending", result.Status);
        _contextMock.Verify(c => c.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CreateBookingAsync_WithUnavailableSlot_ThrowsSlotNotAvailableException()
    {
        // Arrange
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        _slotServiceMock.Setup(s => s.IsSlotAvailableAsync(request.SlotId))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<SlotNotAvailableException>(
            () => _bookingService.CreateBookingAsync(request));
    }
}
```

#### SlotService Tests
```csharp
public class SlotServiceTests
{
    [Fact]
    public async Task IsSlotAvailableAsync_WithAvailableSlot_ReturnsTrue()
    {
        // Arrange
        var slotId = Guid.NewGuid();
        var contextMock = new Mock<IApplicationDbContext>();
        var slots = new List<Slot> 
        { 
            new Slot { Id = slotId, IsAvailable = true, AvailableBookings = 1 } 
        }.AsQueryable();

        var slotsMock = new Mock<DbSet<Slot>>();
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Provider).Returns(slots.Provider);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Expression).Returns(slots.Expression);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.ElementType).Returns(slots.ElementType);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.GetEnumerator()).Returns(slots.GetEnumerator());

        contextMock.Setup(c => c.Slots).Returns(slotsMock.Object);

        var slotService = new SlotService(contextMock.Object);

        // Act
        var result = await slotService.IsSlotAvailableAsync(slotId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsSlotAvailableAsync_WithUnavailableSlot_ReturnsFalse()
    {
        // Arrange
        var slotId = Guid.NewGuid();
        var contextMock = new Mock<IApplicationDbContext>();
        var slots = new List<Slot> 
        { 
            new Slot { Id = slotId, IsAvailable = false, AvailableBookings = 0 } 
        }.AsQueryable();

        var slotsMock = new Mock<DbSet<Slot>>();
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Provider).Returns(slots.Provider);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.Expression).Returns(slots.Expression);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.ElementType).Returns(slots.ElementType);
        slotsMock.As<IQueryable<Slot>>().Setup(m => m.GetEnumerator()).Returns(slots.GetEnumerator());

        contextMock.Setup(c => c.Slots).Returns(slotsMock.Object);

        var slotService = new SlotService(contextMock.Object);

        // Act
        var result = await slotService.IsSlotAvailableAsync(slotId);

        // Assert
        Assert.False(result);
    }
}
```

### 4. Validator Unit Tests

#### BookingValidator Tests
```csharp
public class BookingValidatorTests
{
    [Fact]
    public async Task ValidateCreateBookingRequestAsync_WithValidRequest_DoesNotThrow()
    {
        // Arrange
        var slotServiceMock = new Mock<ISlotService>();
        slotServiceMock.Setup(s => s.IsSlotAvailableAsync(It.IsAny<Guid>()))
            .ReturnsAsync(true);

        var bookingServiceMock = new Mock<IBookingService>();
        bookingServiceMock.Setup(b => b.GetBookingByCustomerAndSlotAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync((Booking)null);

        var slotServiceMock2 = new Mock<ISlotService>();
        slotServiceMock2.Setup(s => s.GetSlotByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new Slot { StartDateTime = DateTime.UtcNow.AddHours(-1), EndDateTime = DateTime.UtcNow.AddHours(1) });

        var validator = new BookingValidator(slotServiceMock.Object, bookingServiceMock.Object, slotServiceMock2.Object);
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        // Act & Assert
        await validator.ValidateCreateBookingRequestAsync(request);
        // If no exception is thrown, the test passes
    }

    [Fact]
    public async Task ValidateCreateBookingRequestAsync_WithUnavailableSlot_ThrowsSlotNotAvailableException()
    {
        // Arrange
        var slotServiceMock = new Mock<ISlotService>();
        slotServiceMock.Setup(s => s.IsSlotAvailableAsync(It.IsAny<Guid>()))
            .ReturnsAsync(false);

        var validator = new BookingValidator(slotServiceMock.Object, null, null);
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        // Act & Assert
        await Assert.ThrowsAsync<SlotNotAvailableException>(
            () => validator.ValidateCreateBookingRequestAsync(request));
    }
}
```

## Integration Testing Strategy

### 1. Test Environment
- Use in-memory SQLite database for integration tests
- Test against real database schema
- Use TestServer for API integration tests

### 2. Database Integration Tests

#### BookingRepository Integration Tests
```csharp
public class BookingRepositoryIntegrationTests : IClassFixture<BookingServiceFactory>
{
    private readonly BookingServiceFactory _factory;

    public BookingRepositoryIntegrationTests(BookingServiceFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateBooking_WithValidData_SavesToDatabase()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        // Act
        var response = await client.PostAsync("/bookings",
            new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json"));

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var bookingResponse = JsonSerializer.Deserialize<BookingResponse>(responseContent);

        Assert.NotNull(bookingResponse.Data);
        Assert.Equal(request.CustomerId, bookingResponse.Data.CustomerId);
        Assert.Equal("Pending", bookingResponse.Data.Status);
    }
}
```

### 3. API Integration Tests

#### BookingController Integration Tests
```csharp
public class BookingControllerIntegrationTests : IClassFixture<BookingServiceFactory>
{
    private readonly BookingServiceFactory _factory;

    public BookingControllerIntegrationTests(BookingServiceFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateBooking_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var invalidRequest = new CreateBookingRequest(); // Missing required fields

        // Act
        var response = await client.PostAsync("/bookings",
            new StringContent(JsonSerializer.Serialize(invalidRequest), Encoding.UTF8, "application/json"));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateBooking_WithUnavailableSlot_ReturnsConflict()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new CreateBookingRequest
        {
            CustomerId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(), // Non-existent slot
            TenantId = Guid.NewGuid(),
            BookingDate = DateTime.UtcNow
        };

        // Act
        var response = await client.PostAsync("/bookings",
            new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json"));

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
```

## End-to-End Testing Strategy

### 1. Test Scenarios

#### Complete Booking Journey
```gherkin
Feature: Complete Booking Journey
  As a customer
  I want to book a service
  So that I can receive the service at the scheduled time

  Scenario: Successful booking with payment and notification
    Given a customer wants to book a service
    And a slot is available for the service
    When the customer creates a booking
    Then the booking is created with "Pending" status
    And a payment is processed successfully
    And the booking status is updated to "Confirmed"
    And confirmation notifications are sent to customer and provider
```

#### Booking Cancellation
```gherkin
Feature: Booking Cancellation
  As a customer
  I want to cancel my booking
  So that I can get a refund if eligible

  Scenario: Successful booking cancellation with refund
    Given a customer has a confirmed booking
    And the cancellation policy allows cancellation
    When the customer cancels the booking
    Then the booking status is updated to "Cancelled"
    And a refund is processed
    And cancellation notifications are sent to customer and provider
```

#### Booking Rescheduling
```gherkin
Feature: Booking Rescheduling
  As a customer
  I want to reschedule my booking
 So that I can receive the service at a different time

  Scenario: Successful booking rescheduling
    Given a customer has a confirmed booking
    And a new slot is available
    When the customer reschedules the booking
    Then the booking is updated with the new slot
    And rescheduling notifications are sent to customer and provider
```

### 2. E2E Test Implementation

#### Booking Journey E2E Test
```csharp
public class BookingJourneyE2ETests
{
    [Fact]
    public async Task CompleteBookingJourney_WorksEndToEnd()
    {
        // Arrange
        var testEnvironment = new TestEnvironment();
        var customer = await testEnvironment.CreateCustomerAsync();
        var service = await testEnvironment.CreateServiceAsync();
        var slot = await testEnvironment.CreateAvailableSlotAsync(service.Id);

        // Act & Assert - Step 1: Create booking
        var booking = await testEnvironment.CreateBookingAsync(new CreateBookingRequest
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            SlotId = slot.Id,
            TenantId = service.TenantId,
            BookingDate = DateTime.UtcNow
        });

        Assert.NotNull(booking);
        Assert.Equal("Pending", booking.Status);

        // Act & Assert - Step 2: Process payment (triggered by event)
        await testEnvironment.WaitForEventAsync<PaymentProcessedEvent>();
        var updatedBooking = await testEnvironment.GetBookingAsync(booking.Id);
        Assert.Equal("Confirmed", updatedBooking.Status);

        // Act & Assert - Step 3: Verify notifications sent
        await testEnvironment.WaitForEventAsync<NotificationSentEvent>();
        var notifications = await testEnvironment.GetNotificationsForUserAsync(customer.Id);
        Assert.NotEmpty(notifications);
        Assert.Contains(notifications, n => n.Channel == "BookingConfirmation");
    }
}
```

## Performance Testing Strategy

### 1. Load Testing
- Test concurrent booking requests
- Measure response times under load
- Verify system scalability

#### Load Test Example
```csharp
public class BookingLoadTests
{
    [Fact]
    public async Task CreateBookingsConcurrently_PerformsUnderLoad()
    {
        // Arrange
        var testEnvironment = new TestEnvironment();
        var service = await testEnvironment.CreateServiceAsync();
        var slots = await testEnvironment.CreateMultipleAvailableSlotsAsync(service.Id, 100);
        var customers = await testEnvironment.CreateMultipleCustomersAsync(100);

        var requests = customers.Zip(slots, (customer, slot) => new CreateBookingRequest
        {
            CustomerId = customer.Id,
            ServiceId = service.Id,
            SlotId = slot.Id,
            TenantId = service.TenantId,
            BookingDate = DateTime.UtcNow
        }).ToList();

        // Act
        var stopwatch = Stopwatch.StartNew();
        var tasks = requests.Select(request => testEnvironment.CreateBookingAsync(request));
        var results = await Task.WhenAll(tasks);
        stopwatch.Stop();

        // Assert
        Assert.All(results, booking => Assert.NotNull(booking));
        Assert.True(stopwatch.Elapsed.TotalSeconds < 30, "Should complete within 30 seconds");
    }
}
```

### 2. Stress Testing
- Test system behavior under extreme load
- Verify graceful degradation
- Test recovery mechanisms

## Security Testing Strategy

### 1. Input Validation Tests
- Test for SQL injection
- Test for XSS attacks
- Test for buffer overflows

### 2. Authentication Tests
- Test unauthorized access
- Test token expiration
- Test role-based access control

### 3. Data Protection Tests
- Verify sensitive data encryption
- Test data leakage prevention
- Verify audit logging

## Test Data Management

### 1. Test Data Seeding
```csharp
public class TestDataSeeder
{
    public async Task SeedTestDataAsync(ApplicationDbContext context)
    {
        // Create test tenants
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test Tenant",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Tenants.Add(tenant);

        // Create test users
        var customer = new User
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "Test",
            LastName = "Customer",
            UserType = "Customer",
            TenantId = tenant.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Users.Add(customer);

        // Save changes
        await context.SaveChangesAsync();
    }
}
```

### 2. Test Data Cleanup
```csharp
public class TestDatabaseFixture : IDisposable
{
    public ApplicationDbContext Context { get; private set; }

    public TestDatabaseFixture()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("TestDatabase")
            .Options;

        Context = new ApplicationDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Database.EnsureDeleted();
        Context.Dispose();
    }
}
```

## Continuous Integration Testing

### 1. Test Execution Pipeline
```yaml
# GitHub Actions workflow
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '8.0.x'
    - name: Restore dependencies
      run: dotnet restore
    - name: Build
      run: dotnet build --no-restore
    - name: Run unit tests
      run: dotnet test --no-build --verbosity normal --filter "Unit"
    - name: Run integration tests
      run: dotnet test --no-build --verbosity normal --filter "Integration"
    - name: Run E2E tests
      run: dotnet test --no-build --verbosity normal --filter "E2E"
    - name: Upload coverage reports
      uses: codecov/codecov-action@v1
```

### 2. Code Coverage Requirements
- Minimum 80% overall coverage
- 100% coverage for business-critical code paths
- No critical or high severity issues in static analysis

## Test Reporting and Monitoring

### 1. Test Results Dashboard
- Track test execution trends
- Monitor code coverage metrics
- Identify flaky tests

### 2. Performance Metrics
- Track response time trends
- Monitor resource utilization
- Identify performance regressions

### 3. Error Tracking
- Monitor test failure patterns
- Track error frequency and severity
- Correlate errors with code changes

## Test Maintenance Strategy

### 1. Test Refactoring
- Regular review of test code quality
- Refactor tests when production code changes
- Remove obsolete tests

### 2. Test Data Management
- Regular cleanup of test data
- Update test data as business requirements change
- Maintain test data consistency

### 3. Test Environment Management
- Automate test environment setup
- Ensure environment consistency
- Monitor test environment health

This comprehensive testing strategy ensures that the booking system is thoroughly tested at all levels, providing confidence in the correctness, reliability, and performance of the implementation.