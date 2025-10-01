# AI Coding Agent Policy Guidelines for Database Context and Migrations

## 1. Overview

This document provides policy guidelines for AI coding agents when implementing database contexts and managing migrations in the Multi-Tenant Appointment Booking System. These guidelines ensure consistency, security, and maintainability across all microservices while adhering to the system's architectural principles.

## 2. Migration Generation Policies

### 2.1 Migration Generation Process

AI coding agents must follow these steps when generating migrations:

1. Ensure all entity model changes are complete before generating migrations
2. Verify that the `ApplicationDbContext` in the Shared project reflects all changes
3. Generate migrations using the designated migration service (UserService)
4. Review generated migration files for accuracy before committing
5. Test migrations in development environment before promoting to higher environments

### 2.2 Migration Generation Commands

#### Initial Migration Setup
Before generating migrations, ensure the EF Core tools are installed globally:
```bash
dotnet tool install --global dotnet-ef
```

#### Generating New Migrations
To create a new migration, execute the following command from the project root directory (`c:\Sudipto\KilloCode\Code\AppointmentScheduler`):
```bash
dotnet ef migrations add MigrationName --project shared/Shared.csproj --startup-project backend/services/UserService/UserService.csproj
```

Example:
```bash
dotnet ef migrations add AddUserProfileFields --project shared/Shared.csproj --startup-project backend/services/UserService/UserService.csproj
```

#### Removing Last Migration
To remove the last migration (if not yet applied to database):
```bash
dotnet ef migrations remove --project shared/Shared.csproj --startup-project backend/services/UserService/UserService.csproj
```

#### Applying Migrations to Database
To apply all pending migrations to the database:
```bash
dotnet ef database update --project shared/Shared.csproj --startup-project backend/services/UserService/UserService.csproj
```

#### Generating SQL Script for Migrations
To generate a SQL script for migrations (useful for production deployments):
```bash
dotnet ef migrations script --project shared/Shared.csproj --startup-project backend/services/UserService/UserService.csproj
```

### 2.3 Migration Execution Directories

All migration commands must be executed from the project root directory: `c:\Sudipto\KilloCode\Code\AppointmentScheduler`

This ensures that relative paths to project files are correctly resolved. The directory structure is as follows:
```
c:\Sudipto\KilloCode\Code\AppointmentScheduler\
├── backend\
│   └── services\
│       └── UserService\
│           ├── UserService.csproj
│           └── [other service files]
├── shared\
│   ├── Shared.csproj
│   ├── Data\
│   │   └── ApplicationDbContext.cs
│   ├── Models\
│   │   ├── User.cs
│   │   └── [other entity models]
│   └── Migrations\
│       ├── [migration files]
│       └── ApplicationDbContextModelSnapshot.cs
└── [other project files]
```

### 2.4 Migration Naming Conventions

Follow these naming conventions for migrations:
1. Use PascalCase for migration names
2. Start with a verb describing the change (e.g., Add, Remove, Update, Fix)
3. Be descriptive but concise
4. Include the entity or feature name when applicable

Examples:
- `AddUserProfileFields`
- `RemoveObsoleteColumns`
- `UpdateServiceCategoryConstraints`
- `FixDecimalPrecisionIssues`

## 3. DbContext Implementation Policies

### 3.1 DbContext Placement Strategy

#### For Single Database Architecture:
- Place the shared `ApplicationDbContext` in the `shared/Data/` directory
- All microservices must reference this shared DbContext
- The DbContext should include `DbSets` for all entities across all services
- Maintain a single source of truth for database schema and relationships

#### For Service-Specific Contexts (if applicable):
- Each microservice maintains its own DbContext in its respective `Models/` directory
- Context should only include entities relevant to that specific service
- Shared entities must be referenced from the Shared project

### 3.2 Entity Registration Guidelines

#### Required Practices:
- Register all entities as `DbSets` in the DbContext
- Implement proper entity configurations in `OnModelCreating()`
- Define primary keys, indexes, and constraints
- Establish entity relationships with appropriate foreign keys
- Apply data validation through Fluent API configurations

#### Entity Configuration Requirements:
```csharp
// Example entity configuration
modelBuilder.Entity<User>(entity =>
{
    entity.HasKey(e => e.Id);
    
    entity.HasIndex(e => e.Email).IsUnique();
    
    entity.Property(e => e.Email)
        .IsRequired()
        .HasMaxLength(255);
        
    entity.Property(e => e.PasswordHash)
        .IsRequired()
        .HasMaxLength(255);
});
```

### 3.3 Multi-Tenancy Considerations

#### Tenant Isolation Implementation:
- All entities must include a `TenantId` property for tenant isolation
- Implement global query filters to automatically scope queries to the current tenant
- Ensure all CRUD operations respect tenant boundaries
- Apply appropriate indexes on `TenantId` columns for performance

#### Example Implementation:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Apply tenant filter to all entities that support multi-tenancy
    modelBuilder.Entity<User>()
        .HasQueryFilter(e => e.TenantId == GetCurrentTenantId());
        
    // Configure tenant-specific indexes
    modelBuilder.Entity<User>()
        .HasIndex(e => new { e.TenantId, e.Email })
        .IsUnique();
}
```

## 4. Security and Compliance Policies

### 4.1 Data Protection Requirements

#### Sensitive Data Handling:
- Never store passwords in plain text; always use proper hashing
- Encrypt sensitive personal information at rest
- Implement column-level encryption for PII (Personally Identifiable Information)
- Apply data masking for non-production environments

#### Access Control Implementation:
- Implement role-based access control at the database level where applicable
- Use parameterized queries to prevent SQL injection
- Apply least privilege principles for database connections
- Regularly audit database access permissions

### 4.2 Compliance Considerations

#### GDPR Compliance:
- Implement data retention policies
- Support data anonymization and deletion requests
- Maintain audit trails for data access
- Ensure cross-border data transfer compliance

#### PCI DSS Compliance:
- Isolate payment-related data in separate tables
- Implement additional encryption for payment data
- Restrict access to payment information
- Maintain compliance audit logs

## 5. Performance Optimization Policies

### 5.1 Indexing Strategies

#### Required Indexes:
- Primary key indexes (automatically created)
- Foreign key indexes for all relationships
- Unique constraint indexes for business rules
- Composite indexes for common query patterns

#### Performance Considerations:
- Avoid over-indexing which can slow down write operations
- Regularly monitor and update index usage statistics
- Implement covering indexes for read-heavy queries
- Consider partitioning for large tables

### 5.2 Query Optimization

#### Best Practices:
- Use asynchronous database operations
- Implement proper pagination for large result sets
- Minimize N+1 query problems through eager loading
- Use compiled queries for frequently executed operations

#### Example Implementation:
```csharp
// Asynchronous operation
public async Task<User> GetUserByIdAsync(Guid id)
{
    return await _context.Users
        .Include(u => u.Bookings)
        .FirstOrDefaultAsync(u => u.Id == id);
}

// Pagination
public async Task<PagedResult<User>> GetUsersAsync(int page, int pageSize)
{
    var users = await _context.Users
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
        
    var total = await _context.Users.CountAsync();
    
    return new PagedResult<User>(users, total, pageSize);
}
```

## 6. Monitoring and Observability Policies

### 6.1 Database Performance Monitoring

#### Required Metrics:
- Query execution times
- Connection pool utilization
- Database size and growth trends
- Index usage statistics
- Deadlock and timeout occurrences

#### Implementation Guidelines:
- Integrate with Application Insights for telemetry
- Implement custom metrics for business-critical operations
- Set up alerts for performance degradation
- Regularly review and optimize slow queries

### 6.2 Migration Monitoring

#### Tracking Requirements:
- Migration success/failure rates
- Migration duration metrics
- Rollback frequency and reasons
- Database schema change history

#### Implementation:
- Log all migration operations with timestamps
- Monitor application health during and after migrations
- Implement circuit breaker patterns for database connectivity
- Maintain runbooks for migration-related incidents

## 7. Backup and Recovery Policies

### 7.1 Backup Strategies

#### Required Backups:
- Daily full database backups
- Hourly transaction log backups
- Weekly differential backups
- Offsite backup storage for disaster recovery

#### Backup Validation:
- Regular restore testing in isolated environments
- Backup integrity verification
- Recovery time objective (RTO) testing
- Recovery point objective (RPO) validation

### 7.2 Recovery Procedures

#### Disaster Recovery:
- Maintain multiple recovery point objectives
- Document step-by-step recovery procedures
- Regular disaster recovery drills
- Cross-region backup strategies

#### Data Corruption Recovery:
- Implement point-in-time recovery capabilities
- Maintain clean database snapshots
- Regular consistency checks
- Automated corruption detection

## 8. Version Control and Collaboration Policies

### 8.1 Code Review Requirements

#### DbContext Changes:
- All DbContext modifications require peer review
- Migration scripts must be reviewed for correctness
- Entity relationship changes need architectural approval
- Performance impact assessments for schema changes

#### Migration Scripts:
- Review for SQL injection vulnerabilities
- Verify rollback capabilities
- Check for environment-specific configurations
- Validate against database coding standards

### 8.2 Branching Strategy

#### Database Changes:
- Create feature branches for schema modifications
- Merge to development after testing
- Promote through staging to production
- Tag releases with database version information

## 9. Testing Policies

### 9.1 Unit Testing Guidelines

#### DbContext Testing:
- Use in-memory database for unit tests when possible
- Test entity configurations and validations
- Verify query filters and tenant isolation
- Validate relationship mappings

#### Migration Testing:
- Test migrations in isolated test databases
- Verify both Up and Down operations
- Validate data integrity after migration
- Test rollback scenarios

### 9.2 Integration Testing

#### Database Integration:
- Test against actual database instances
- Validate cross-service data consistency
- Verify performance under load
- Test multi-tenancy scenarios

## 10. Documentation Requirements

### 10.1 Schema Documentation

#### Required Documentation:
- Entity relationship diagrams
- Database schema change logs
- Index and constraint documentation
- Migration runbooks

#### Update Procedures:
- Document all schema changes in changelogs
- Update entity diagrams with each modification
- Maintain migration runbooks for operational procedures
- Keep API documentation synchronized with schema changes

### 10.2 Operational Documentation

#### Required Runbooks:
- Migration application procedures
- Rollback processes
- Performance tuning guides
- Troubleshooting documentation

This policy document serves as a reference for AI coding agents to ensure consistent, secure, and maintainable database implementations across all microservices in the Multi-Tenant Appointment Booking System.