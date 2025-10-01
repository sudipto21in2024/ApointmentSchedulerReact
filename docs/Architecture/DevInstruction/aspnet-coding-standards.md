# ASP.NET Core & C# Coding Standards for AI Coding Agents

## Table of Contents
1. [General Principles](#general-principles)
2. [File Organization & Structure](#file-organization--structure)
3. [Naming Conventions](#naming-conventions)
4. [Code Formatting & Style](#code-formatting--style)
5. [ASP.NET Core Specific Guidelines](#aspnet-core-specific-guidelines)
6. [Data Access & Entity Framework](#data-access--entity-framework)
7. [Error Handling & Logging](#error-handling--logging)
8. [Security Best Practices](#security-best-practices)
9. [Performance Guidelines](#performance-guidelines)
10. [Testing Standards](#testing-standards)
11. [Documentation Requirements](#documentation-requirements)
12. [Code Review Checklist](#code-review-checklist)

## General Principles

### Core Guidelines
- **Consistency**: Follow established patterns throughout the codebase
- **Readability**: Code should be self-documenting and easy to understand
- **SOLID Principles**: Adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication through abstraction
- **YAGNI (You Aren't Gonna Need It)**: Only implement what's currently needed
- **Fail Fast**: Validate inputs and fail early with meaningful error messages

### Code Quality Metrics
- Maximum method length: 20 lines (excluding braces)
- Maximum class length: 300 lines
- Maximum cyclomatic complexity: 10
- Minimum test coverage: 80%

## File Organization & Structure

### Project Structure
```
src/
├── YourApp.Api/              # Web API project
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   └── Program.cs
├── YourApp.Core/             # Business logic
│   ├── Entities/
│   ├── Interfaces/
│   ├── Services/
│   └── Exceptions/
├── YourApp.Infrastructure/   # Data access & external services
│   ├── Data/
│   ├── Repositories/
│   └── Services/
└── YourApp.Tests/           # Test projects
    ├── Unit/
    ├── Integration/
    └── E2E/
```

### File Naming
- Use PascalCase for all file names
- Match file name with the primary class name
- Use descriptive, meaningful names
- Avoid abbreviations unless widely understood

**Examples:**
```
✅ UserController.cs
✅ IUserRepository.cs
✅ UserNotFoundException.cs
❌ UsrCtrl.cs
❌ IUsrRepo.cs
```

## Naming Conventions

### Classes and Interfaces
```csharp
// Classes: PascalCase
public class UserService { }
public class EmailNotificationService { }

// Interfaces: PascalCase with 'I' prefix
public interface IUserRepository { }
public interface IEmailService { }

// Abstract classes: PascalCase with 'Base' suffix
public abstract class BaseController { }
public abstract class BaseEntity { }
```

### Methods and Properties
```csharp
// Methods: PascalCase, use verbs
public async Task<User> GetUserByIdAsync(int userId) { }
public bool ValidateUserInput(UserModel model) { }

// Properties: PascalCase, use nouns
public string FirstName { get; set; }
public DateTime CreatedAt { get; set; }
public bool IsActive { get; set; }
```

### Variables and Parameters
```csharp
// Local variables: camelCase
var userName = "john.doe";
var userList = new List<User>();

// Parameters: camelCase
public User CreateUser(string firstName, string lastName, string emailAddress)
{
    // Implementation
}

// Private fields: camelCase with underscore prefix
private readonly IUserRepository _userRepository;
private readonly ILogger<UserService> _logger;
```

### Constants and Enums
```csharp
// Constants: PascalCase
public const string DefaultConnectionString = "Server=localhost;Database=MyApp;";
public const int MaxRetryAttempts = 3;

// Enums: PascalCase for enum and values
public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    PendingVerification
}
```

## Code Formatting & Style

### Indentation and Spacing
- Use 4 spaces for indentation (no tabs)
- One statement per line
- Braces on new line (Allman style)
- Single space after keywords and around operators

```csharp
// ✅ Correct formatting
if (user != null)
{
    var result = await _userService.UpdateUserAsync(user.Id, updateModel);
    return Ok(result);
}

// ❌ Incorrect formatting
if(user!=null){
var result=await _userService.UpdateUserAsync(user.Id,updateModel);
return Ok(result);}
```

### Method Structure
```csharp
public async Task<ActionResult<UserDto>> GetUserAsync(int userId)
{
    // 1. Input validation
    if (userId <= 0)
    {
        return BadRequest("User ID must be greater than zero.");
    }

    // 2. Business logic
    var user = await _userService.GetUserByIdAsync(userId);
    
    // 3. Null checking
    if (user == null)
    {
        return NotFound($"User with ID {userId} not found.");
    }

    // 4. Return result
    var userDto = _mapper.Map<UserDto>(user);
    return Ok(userDto);
}
```

### Using Statements
- Place using statements at the top of the file
- Sort alphabetically
- Group system namespaces first, then third-party, then local

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using YourApp.Core.Interfaces;
using YourApp.Core.Models;
```

## ASP.NET Core Specific Guidelines

### Controller Design
```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        // Implementation
    }
}
```

### Dependency Injection
```csharp
// Program.cs - Service registration
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();

// Constructor injection pattern
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
}
```

### Middleware Implementation
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
        
        var response = exception switch
        {
            ValidationException => new { error = exception.Message, statusCode = 400 },
            NotFoundException => new { error = exception.Message, statusCode = 404 },
            _ => new { error = "An error occurred", statusCode = 500 }
        };

        context.Response.StatusCode = response.statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

## Data Access & Entity Framework

### Entity Design
```csharp
public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Order> Orders { get; set; } = new HashSet<Order>();
}

public abstract class BaseEntity
{
    public int Id { get; set; }
}
```

### DbContext Configuration
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            
            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
```

### Repository Pattern
```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

    public virtual async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(e => e.Id == id);
    }
}
```

## Error Handling & Logging

### Custom Exceptions
```csharp
public abstract class ApplicationException : Exception
{
    protected ApplicationException(string message) : base(message) { }
    protected ApplicationException(string message, Exception innerException) : base(message, innerException) { }
}

public class ValidationException : ApplicationException
{
    public ValidationException(string message) : base(message) { }
    public ValidationException(string message, Exception innerException) : base(message, innerException) { }
}

public class NotFoundException : ApplicationException
{
    public NotFoundException(string entityName, object key) 
        : base($"Entity '{entityName}' with key '{key}' was not found.") { }
}

public class BusinessLogicException : ApplicationException
{
    public BusinessLogicException(string message) : base(message) { }
}
```

### Logging Guidelines
```csharp
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public async Task<User> CreateUserAsync(CreateUserModel model)
    {
        _logger.LogInformation("Creating user with email: {Email}", model.Email);

        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(model.Email))
            {
                _logger.LogWarning("Attempted to create user with empty email");
                throw new ValidationException("Email is required");
            }

            // Check for existing user
            var existingUser = await _userRepository.GetByEmailAsync(model.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Attempted to create user with duplicate email: {Email}", model.Email);
                throw new BusinessLogicException("User with this email already exists");
            }

            // Create user
            var user = new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Status = UserStatus.Active
            };

            var createdUser = await _userRepository.AddAsync(user);
            
            _logger.LogInformation("Successfully created user with ID: {UserId}", createdUser.Id);
            return createdUser;
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is BusinessLogicException))
        {
            _logger.LogError(ex, "Unexpected error occurred while creating user with email: {Email}", model.Email);
            throw;
        }
    }
}
```

### Log Levels Usage
- **LogTrace**: Very detailed information, typically only of interest when diagnosing problems
- **LogDebug**: Detailed information, typically only of interest when diagnosing problems
- **LogInformation**: General information about application flow
- **LogWarning**: Anything that can potentially cause application oddities but is automatically recoverable
- **LogError**: Any error which is fatal to the operation but not the service or application
- **LogCritical**: Anything that can cause the service or application to abort

## Security Best Practices

### Input Validation
```csharp
public class CreateUserModel
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]", 
        ErrorMessage = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character")]
    public string Password { get; set; } = string.Empty;
}
```

### Authorization
```csharp
[Authorize(Roles = "Admin,Manager")]
public class AdminController : ControllerBase
{
    [HttpPost("users")]
    [Authorize(Policy = "CreateUserPolicy")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserModel model)
    {
        // Implementation
    }

    [HttpDelete("users/{id}")]
    [Authorize(Policy = "DeleteUserPolicy")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        // Implementation
    }
}

// Policy configuration in Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CreateUserPolicy", policy =>
        policy.RequireRole("Admin")
              .RequireClaim("permission", "users:create"));
    
    options.AddPolicy("DeleteUserPolicy", policy =>
        policy.RequireRole("Admin")
              .RequireClaim("permission", "users:delete"));
});
```

### Secure Configuration
```csharp
// appsettings.json - Never store secrets here
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyApp;Integrated Security=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}

// Use Azure Key Vault or similar for secrets in production
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

## Performance Guidelines

### Async/Await Best Practices
```csharp
// ✅ Correct: Use ConfigureAwait(false) in libraries
public async Task<User> GetUserAsync(int id)
{
    var user = await _repository.GetByIdAsync(id).ConfigureAwait(false);
    return user;
}

// ✅ Correct: Use async all the way
public async Task<ActionResult<UserDto>> GetUser(int id)
{
    var user = await _userService.GetUserAsync(id);
    if (user == null)
        return NotFound();
    
    var userDto = _mapper.Map<UserDto>(user);
    return Ok(userDto);
}

// ❌ Incorrect: Don't block on async calls
public User GetUser(int id)
{
    return _userService.GetUserAsync(id).Result; // Deadlock risk
}
```

### Entity Framework Optimization
```csharp
// Use projection to avoid loading unnecessary data
public async Task<IEnumerable<UserSummaryDto>> GetUserSummariesAsync()
{
    return await _context.Users
        .Select(u => new UserSummaryDto
        {
            Id = u.Id,
            Name = u.FirstName + " " + u.LastName,
            Email = u.Email
        })
        .ToListAsync();
}

// Use Include for eager loading when needed
public async Task<User?> GetUserWithOrdersAsync(int id)
{
    return await _context.Users
        .Include(u => u.Orders)
        .FirstOrDefaultAsync(u => u.Id == id);
}

// Use pagination for large datasets
public async Task<PagedResult<UserDto>> GetUsersAsync(int page, int pageSize)
{
    var totalCount = await _context.Users.CountAsync();
    
    var users = await _context.Users
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(u => new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email
        })
        .ToListAsync();

    return new PagedResult<UserDto>
    {
        Items = users,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
```

### Memory Management
```csharp
// Use using statements for IDisposable objects
public async Task ProcessLargeFileAsync(string filePath)
{
    using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
    using var reader = new StreamReader(fileStream);
    
    string line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
        // Process line
    }
}

// Use StringBuilder for string concatenation in loops
public string BuildUserReport(IEnumerable<User> users)
{
    var report = new StringBuilder();
    
    foreach (var user in users)
    {
        report.AppendLine($"{user.FirstName} {user.LastName} - {user.Email}");
    }
    
    return report.ToString();
}
```

## Testing Standards

### Unit Testing Structure
```csharp
[TestClass]
public class UserServiceTests
{
    private Mock<IUserRepository> _mockUserRepository;
    private Mock<ILogger<UserService>> _mockLogger;
    private UserService _userService;

    [TestInitialize]
    public void Setup()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _userService = new UserService(_mockUserRepository.Object, _mockLogger.Object);
    }

    [TestMethod]
    public async Task GetUserByIdAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User { Id = userId, FirstName = "John", LastName = "Doe" };
        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
                          .ReturnsAsync(expectedUser);

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(expectedUser.Id, result.Id);
        Assert.AreEqual(expectedUser.FirstName, result.FirstName);
    }

    [TestMethod]
    public async Task GetUserByIdAsync_InvalidId_ThrowsArgumentException()
    {
        // Arrange
        var invalidId = -1;

        // Act & Assert
        await Assert.ThrowsExceptionAsync<ArgumentException>(
            () => _userService.GetUserByIdAsync(invalidId));
    }

    [TestMethod]
    public async Task CreateUserAsync_ValidUser_ReturnsCreatedUser()
    {
        // Arrange
        var createModel = new CreateUserModel
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com"
        };

        var expectedUser = new User
        {
            Id = 1,
            FirstName = createModel.FirstName,
            LastName = createModel.LastName,
            Email = createModel.Email
        };

        _mockUserRepository.Setup(r => r.GetByEmailAsync(createModel.Email))
                          .ReturnsAsync((User)null);
        _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>()))
                          .ReturnsAsync(expectedUser);

        // Act
        var result = await _userService.CreateUserAsync(createModel);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(expectedUser.FirstName, result.FirstName);
        _mockUserRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
    }
}
```

### Integration Testing
```csharp
[TestClass]
public class UsersControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UsersControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [TestMethod]
    public async Task GetUser_ValidId_ReturnsOkResult()
    {
        // Arrange
        var userId = 1;

        // Act
        var response = await _client.GetAsync($"/api/users/{userId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<UserDto>(content);
        
        Assert.IsNotNull(user);
        Assert.AreEqual(userId, user.Id);
    }
}
```

## Documentation Requirements

### XML Documentation
```csharp
/// <summary>
/// Service for managing user-related operations.
/// </summary>
public class UserService : IUserService
{
    /// <summary>
    /// Retrieves a user by their unique identifier.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <returns>The user if found; otherwise, null.</returns>
    /// <exception cref="ArgumentException">Thrown when userId is less than or equal to zero.</exception>
    public async Task<User?> GetUserByIdAsync(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User ID must be greater than zero.", nameof(userId));
        }

        return await _userRepository.GetByIdAsync(userId);
    }

    /// <summary>
    /// Creates a new user with the specified information.
    /// </summary>
    /// <param name="model">The user creation model containing user details.</param>
    /// <returns>The created user with assigned ID.</returns>
    /// <exception cref="ArgumentNullException">Thrown when model is null.</exception>
    /// <exception cref="ValidationException">Thrown when model validation fails.</exception>
    /// <exception cref="BusinessLogicException">Thrown when business rules are violated.</exception>
    public async Task<User> CreateUserAsync(CreateUserModel model)
    {
        // Implementation
    }
}
```

### README Template
```markdown
# Project Name

## Description
Brief description of what the project does.

## Prerequisites
- .NET 8.0 or later
- SQL Server 2019 or later
- Visual Studio 2022 or VS Code

## Setup Instructions
1. Clone the repository
2. Update connection strings in appsettings.json
3. Run database migrations: `dotnet ef database update`
4. Start the application: `dotnet run`

## API Documentation
Swagger UI is available at `/swagger` when running in development mode.

## Testing
Run tests with: `dotnet test`

## Contributing
Please follow the coding standards outlined in CODING_STANDARDS.md
```

## Code Review Checklist

### Pre-Review Checklist (AI Agent Self-Check)
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Code coverage meets minimum threshold (80%)
- [ ] No hardcoded secrets or sensitive information
- [ ] Proper error handling implemented
- [ ] Logging added for important operations
- [ ] Input validation implemented
- [ ] XML documentation added for public APIs
- [ ] Follows naming conventions
- [ ] No code duplication
- [ ] Performance considerations addressed
- [ ] Security best practices followed

### Review Focus Areas
1. **Architecture & Design**
   - Follows SOLID principles
   - Proper separation of concerns
   - Appropriate use of design patterns

2. **Code Quality**
   - Readable and maintainable
   - Proper error handling
   - Adequate test coverage
   - Performance optimizations

3. **Security**
   - Input validation
   - Authorization checks
   - No security vulnerabilities
   - Secure configuration

4. **Standards Compliance**
   - Follows naming conventions
   - Consistent formatting
   - Proper documentation
   - Best practices implemented

---

## Version History
- **v1.0** - Initial version
- **v1.1** - Added security guidelines
- **v1.2** - Enhanced testing standards
- **v1.3** - Added performance guidelines

## References
- [Microsoft C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- [ASP.NET Core Best Practices](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/best-practices)
- [Entity Framework Core Best Practices](https://docs.microsoft.com/en-us/ef/core/miscellaneous/configuring-dbcontext)

---

*This document should be reviewed and updated regularly to reflect evolving best practices and team standards.*