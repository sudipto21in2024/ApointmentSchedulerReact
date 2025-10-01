# Gap Analysis: Multi-Tenancy Enforcement Across Services

## 1. Identified Gap

The High-Level Design (HLD) and Low-Level Design (LLD) documents mention multi-tenancy, with the User Service LLD specifically mentioning a [`TenantManager`](docs/Architecture/LLD.mmd:11) for tenant isolation. However, there is insufficient detail on how tenant context is propagated and enforced across other core services such as Booking, Payment, and Service Management. Additionally, the statement in the LLD regarding "Separate schemas for tenants to ensure data isolation" ([`docs/Architecture/LLD.mmd:170`]) lacks clarification on its practical implementation and implications.

## 2. Impact

*   **Security Vulnerabilities:** Without clear enforcement mechanisms, there's a significant risk of data leakage or unauthorized access, where one tenant could potentially view or manipulate another tenant's data.
*   **Implementation Inconsistencies:** Each service might implement multi-tenancy handling differently, leading to an inconsistent and error-prone system.
*   **Increased Development Effort:** Developers might need to re-implement tenant filtering logic in every query and operation across multiple services.
*   **Operational Complexity:** Managing and auditing tenant data isolation becomes challenging without a standardized approach.
*   **Scalability and Performance Issues:** Inefficient tenant enforcement can lead to suboptimal database queries or increased load if not properly designed.
*   **Misinterpretation of "Separate Schemas":** If "separate schemas" implies physical database separation per tenant, this has massive operational overhead for deployment, backup, and cross-tenant analytics. If it means logical separation within shared tables, the enforcement mechanism needs to be explicitly defined.

## 3. Detailed Analysis

Multi-tenancy is a fundamental aspect of the system, as stated in HLD section 2: "Multi-Tenant: Supports multiple service providers with isolated data and configurations." The User Service's [`TenantManager`](docs/Architecture/LLD.mmd:11) is a good starting point for managing tenant information. However, the design needs to extend this concept to other services.

Key questions that remain unanswered:
*   How is the tenant ID identified and extracted from incoming requests (e.g., from JWT tokens, request headers)?
*   How is the tenant ID passed between services during inter-service communication?
*   How does each microservice (Booking, Payment, Service Management, Reporting, etc.) filter its data based on the current tenant's context?
*   What is the concrete interpretation of "Separate schemas for tenants"?
    *   **Option A: Physical Separation (Database per Tenant):** Each tenant has its own dedicated database. This offers strong isolation but introduces significant operational complexity (provisioning, scaling, backups, migrations). Cross-tenant queries are extremely difficult.
    *   **Option B: Logical Separation (Shared Database, TenantId Column):** All tenants share the same database, but each table contains a `TenantId` column. All queries must include a `WHERE TenantId = @currentTenantId` clause. This is simpler operationally but requires strict application-level enforcement.
    *   **Option C: Hybrid Approach (Schema per Tenant in Shared DB):** Each tenant has its own schema within a shared database. This provides some logical separation but still requires careful application-level management.

Given the .NET Core and Entity Framework Core stack, Option B (Logical Separation with `TenantId` column) is often the most practical and scalable approach for SaaS applications, especially when combined with global query filters in EF Core.

## 4. Proposed Solution

Establish a clear, consistent, and enforceable multi-tenancy strategy across all microservices.

### 4.1 High-Level Design Updates

*   Explicitly state the chosen multi-tenancy model (e.g., shared database with logical separation via `TenantId`).
*   Add a section on "Tenant Context Propagation" detailing how tenant information is passed from the API Gateway/frontend to backend services and between services.
*   Emphasize that all data-accessing services must enforce tenant isolation.

### 4.2 Low-Level Design Updates

*   **Tenant Context Propagation:**
    *   **API Gateway:** The API Gateway (once formalized) should extract the Tenant ID (e.g., from JWT claims after authentication) and inject it into an HTTP header (e.g., `X-Tenant-Id`) for all downstream service calls.
    *   **Inter-Service Communication:** All internal service-to-service calls (REST, message queues) must include the Tenant ID. For message queues, this could be part of the message payload or metadata.
    *   **Application Context:** Each service should have a mechanism (e.g., a `TenantContext` service or middleware) to retrieve the current Tenant ID from the request context.

*   **Data Isolation Enforcement (Entity Framework Core):**
    *   Leverage **EF Core Global Query Filters** to automatically apply `TenantId` filtering to all relevant entities. This ensures that developers don't forget to add `WHERE TenantId = ...` clauses manually.
    *   Ensure all entities that belong to a tenant (`Booking`, `Service`, `Payment`, `Notification`, etc.) include a `TenantId` property.
    *   Implement **Tenant-Aware Repositories** or base classes that automatically handle `TenantId` assignment on creation and filtering on retrieval.

*   **Tenant-Specific Configuration:**
    *   Detail how the [`Configuration Service`](docs/Architecture/HLD.mmd:51) handles tenant-specific settings and how other services retrieve them based on the current tenant context.

### 4.3 Programming Information

#### 4.3.1 `TenantId` in Entities

All tenant-specific entities should inherit from a base entity or implement an interface that includes `TenantId`.

```csharp
// shared/Models/BaseTenantEntity.cs (New file)
public abstract class BaseTenantEntity
{
    public Guid TenantId { get; set; }
}

// Example: shared/Models/Service.cs
public class Service : BaseTenantEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    // ... other properties
}

// Example: shared/Models/Booking.cs
public class Booking : BaseTenantEntity
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Guid CustomerId { get; set; }
    // ... other properties
}
```

#### 4.3.2 `ApplicationDbContext` with Global Query Filter

Modify the `ApplicationDbContext` to include global query filters.

```csharp
// shared/Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using shared.Models; // Assuming BaseTenantEntity is here
using shared.Contracts; // Assuming ICurrentTenantService is here

public class ApplicationDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService; // Inject a service to get current tenant

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentTenantService currentTenantService)
        : base(options)
    {
        _currentTenantService = currentTenantService;
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    // ... other DbSets

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global query filter for multi-tenancy
        // This ensures that all queries automatically filter by TenantId
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseTenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                    // Only apply filter if a tenant is actually set (e.g., for system-level operations)
                    _ => EF.Property<Guid>(_, "TenantId") == _currentTenantService.TenantId);
            }
        }

        // Configure decimal precision for financial values
        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasColumnType("decimal(18, 2)");

        modelBuilder.Entity<PricingPlan>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18, 2)");
    }

    public override int SaveChanges()
    {
        AddTenantIdBeforeSaving();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AddTenantIdBeforeSaving();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void AddTenantIdBeforeSaving()
    {
        foreach (var entry in ChangeTracker.Entries<BaseTenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.TenantId = _currentTenantService.TenantId;
            }
        }
    }
}
```

#### 4.3.3 `ICurrentTenantService` and Implementation

This service will provide the current tenant's ID. It needs to be registered with the DI container.

```csharp
// shared/Contracts/ICurrentTenantService.cs (New file)
using System;

namespace shared.Contracts
{
    public interface ICurrentTenantService
    {
        Guid TenantId { get; }
        void SetTenantId(Guid tenantId);
    }
}

// backend/services/UserService/Services/CurrentTenantService.cs (Example implementation in a service)
using Microsoft.AspNetCore.Http;
using shared.Contracts;
using System;
using System.Security.Claims;

namespace UserService.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private Guid _tenantId;

        public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            // Attempt to get TenantId from JWT claim or header
            var tenantClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId");
            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out Guid parsedTenantId))
            {
                _tenantId = parsedTenantId;
            }
            // Alternatively, get from a custom header if not using claims for tenant ID
            else if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.Request.Headers.ContainsKey("X-Tenant-Id"))
            {
                if (Guid.TryParse(_httpContextAccessor.HttpContext.Request.Headers["X-Tenant-Id"].ToString(), out Guid headerTenantId))
                {
                    _tenantId = headerTenantId;
                }
            }
        }

        public Guid TenantId => _tenantId;

        public void SetTenantId(Guid tenantId)
        {
            _tenantId = tenantId;
        }
    }
}
```

#### 4.3.4 Middleware for Tenant ID Extraction (Optional, if not using claims directly)

A middleware can extract the `X-Tenant-Id` header and set it in the `ICurrentTenantService`.

```csharp
// shared/Middleware/TenantMiddleware.cs (New file)
using Microsoft.AspNetCore.Http;
using shared.Contracts;
using System.Threading.Tasks;

namespace shared.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService)
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
            {
                if (Guid.TryParse(tenantIdHeader.ToString(), out Guid tenantId))
                {
                    currentTenantService.SetTenantId(tenantId);
                }
            }
            await _next(context);
        }
    }

    public static class TenantMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantMiddleware>();
        }
    }
}
```

#### 4.3.5 Dependency Injection Setup

```csharp
// In each microservice's Program.cs or Startup.cs
builder.Services.AddHttpContextAccessor(); // Required for CurrentTenantService
builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();

// If using middleware:
// app.UseTenantMiddleware(); // Place this before UseAuthentication and UseAuthorization
```

### 5.4 Key Considerations

*   **Tenant Provisioning:** Detail the process of creating new tenants, including schema/data setup and initial configuration.
*   **System-Level Operations:** Identify scenarios where tenant filtering should *not* apply (e.g., system administrators viewing all tenants). The `_currentTenantService.TenantId` check in the global query filter handles this if `TenantId` is `Guid.Empty` or a special system ID.
*   **Performance:** Evaluate the impact of global query filters on performance and consider indexing `TenantId` columns.
*   **Testing:** Ensure robust unit and integration tests for tenant isolation.