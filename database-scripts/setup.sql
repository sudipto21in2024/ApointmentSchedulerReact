-- Create the Users table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    UserType NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2,
    TenantId UNIQUEIDENTIFIER NOT NULL,
    
    CONSTRAINT FK_Users_Tenant FOREIGN KEY (TenantId) REFERENCES Tenants(Id)
);

-- Create the Tenants table
CREATE TABLE Tenants (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Domain NVARCHAR(255),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LogoUrl NVARCHAR(500),
    ContactEmail NVARCHAR(255)
);

-- Create the ServiceCategories table
CREATE TABLE ServiceCategories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    ParentCategoryId UNIQUEIDENTIFIER,
    IconUrl NVARCHAR(500),
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_ServiceCategories_Parent FOREIGN KEY (ParentCategoryId) REFERENCES ServiceCategories(Id)
);

-- Create the Services table
CREATE TABLE Services (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    CategoryId UNIQUEIDENTIFIER NOT NULL,
    ProviderId UNIQUEIDENTIFIER NOT NULL,
    TenantId UNIQUEIDENTIFIER NOT NULL,
    Duration INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsFeatured BIT NOT NULL DEFAULT 0,
    MaxBookingsPerDay INT NOT NULL DEFAULT 10,
    
    CONSTRAINT FK_Services_Category FOREIGN KEY (CategoryId) REFERENCES ServiceCategories(Id),
    CONSTRAINT FK_Services_Provider FOREIGN KEY (ProviderId) REFERENCES Users(Id),
    CONSTRAINT FK_Services_Tenant FOREIGN KEY (TenantId) REFERENCES Tenants(Id)
);

-- Create the Slots table
CREATE TABLE Slots (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceId UNIQUEIDENTIFIER NOT NULL,
    StartDateTime DATETIME2 NOT NULL,
    EndDateTime DATETIME2 NOT NULL,
    MaxBookings INT NOT NULL DEFAULT 1,
    AvailableBookings INT NOT NULL DEFAULT 1,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsRecurring BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_Slots_Service FOREIGN KEY (ServiceId) REFERENCES Services(Id)
);

-- Create the Bookings table
CREATE TABLE Bookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    ServiceId UNIQUEIDENTIFIER NOT NULL,
    SlotId UNIQUEIDENTIFIER NOT NULL,
    TenantId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    BookingDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX),
    CancelledAt DATETIME2,
    CancelledBy UNIQUEIDENTIFIER,
    PaymentId UNIQUEIDENTIFIER,
    
    CONSTRAINT FK_Bookings_Customer FOREIGN KEY (CustomerId) REFERENCES Users(Id),
    CONSTRAINT FK_Bookings_Service FOREIGN KEY (ServiceId) REFERENCES Services(Id),
    CONSTRAINT FK_Bookings_Slot FOREIGN KEY (SlotId) REFERENCES Slots(Id),
    CONSTRAINT FK_Bookings_Tenant FOREIGN KEY (TenantId) REFERENCES Tenants(Id),
    CONSTRAINT FK_Bookings_CancelledBy FOREIGN KEY (CancelledBy) REFERENCES Users(Id),
    CONSTRAINT FK_Bookings_Payment FOREIGN KEY (PaymentId) REFERENCES Payments(Id)
);

-- Create the Payments table
CREATE TABLE Payments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BookingId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    PaymentMethod NVARCHAR(50) NOT NULL,
    PaymentStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    TransactionId NVARCHAR(255),
    PaymentGateway NVARCHAR(100),
    PaidAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    RefundAmount DECIMAL(18,2) DEFAULT 0,
    
    CONSTRAINT FK_Payments_Booking FOREIGN KEY (BookingId) REFERENCES Bookings(Id)
);

-- Create the Reviews table
CREATE TABLE Reviews (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceId UNIQUEIDENTIFIER NOT NULL,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Title NVARCHAR(255),
    Comment NVARCHAR(MAX),
    IsVerified BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_Reviews_Service FOREIGN KEY (ServiceId) REFERENCES Services(Id),
    CONSTRAINT FK_Reviews_Customer FOREIGN KEY (CustomerId) REFERENCES Users(Id)
);

-- Create the Notifications table
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    SentAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2,
    RelatedEntityId UNIQUEIDENTIFIER,
    
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Create the BookingHistories table
CREATE TABLE BookingHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BookingId UNIQUEIDENTIFIER NOT NULL,
    OldStatus NVARCHAR(50),
    NewStatus NVARCHAR(50) NOT NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL,
    ChangeReason NVARCHAR(MAX),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX),
    
    CONSTRAINT FK_BookingHistories_Booking FOREIGN KEY (BookingId) REFERENCES Bookings(Id),
    CONSTRAINT FK_BookingHistories_ChangedBy FOREIGN KEY (ChangedBy) REFERENCES Users(Id)
);

-- Create Indexes

-- For faster user lookups by email
CREATE INDEX IX_Users_Email ON Users(Email);

-- For tenant-based queries
CREATE INDEX IX_Users_TenantId ON Users(TenantId);
CREATE INDEX IX_Services_TenantId ON Services(TenantId);
CREATE INDEX IX_Services_ProviderId ON Services(ProviderId);
CREATE INDEX IX_Slots_ServiceId ON Slots(ServiceId);
CREATE INDEX IX_Bookings_CustomerId ON Bookings(CustomerId);
CREATE INDEX IX_Bookings_ServiceId ON Bookings(ServiceId);
CREATE INDEX IX_Bookings_SlotId ON Bookings(SlotId);
CREATE INDEX IX_Bookings_Status ON Bookings(Status);
CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
CREATE INDEX IX_Reviews_ServiceId ON Reviews(ServiceId);
CREATE INDEX IX_Reviews_CustomerId ON Reviews(CustomerId);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
CREATE INDEX IX_BookingHistories_BookingId ON BookingHistories(BookingId);

-- Add Check Constraints
ALTER TABLE Services ADD CONSTRAINT CHK_Services_Price CHECK (Price >= 0);

-- Duration validation
ALTER TABLE Services ADD CONSTRAINT CHK_Services_Duration CHECK (Duration > 0);

-- Rating validation
ALTER TABLE Reviews ADD CONSTRAINT CHK_Reviews_Rating CHECK (Rating >= 1 AND Rating <= 5);

-- Positive amount validation
ALTER TABLE Payments ADD CONSTRAINT CHK_Payments_Amount CHECK (Amount >= 0);

-- Add Unique Constraints
-- Unique email per tenant
ALTER TABLE Users ADD CONSTRAINT UK_Users_Email_Tenant UNIQUE (Email, TenantId);

-- Unique service name per tenant
ALTER TABLE Services ADD CONSTRAINT UK_Services_Name_Tenant UNIQUE (Name, TenantId);

-- Unique transaction ID per payment gateway
ALTER TABLE Payments ADD CONSTRAINT UK_Payments_TransactionId UNIQUE (TransactionId, PaymentGateway);

-- Data Partitioning Strategy
-- Create partition function
CREATE PARTITION FUNCTION pf_BookingsDate (DATETIME2)
AS RANGE RIGHT FOR VALUES
('2024-01-01', '2025-01-01', '2026-01-01');

-- Create partition scheme
CREATE PARTITION SCHEME ps_BookingsDate
AS PARTITION pf_BookingsDate
ALL TO ([PRIMARY]);

-- Create Hangfire database for background job storage
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HangfireDb')
BEGIN
    CREATE DATABASE HangfireDb;
END
GO

USE HangfireDb;
GO

-- Initial Seed Data
USE AppointmentScheduler;
GO

-- BCrypt hash for password "Happy@123" (generated using BCrypt.Net.BCrypt.HashPassword("Happy@123"))
DECLARE @PasswordHash NVARCHAR(255) = '$2a$11$abcdefghijk.lmnopqrstuvwxyz1234567890ABCDEFGHIJK';

-- Create System Admin Tenant
INSERT INTO Tenants (Id, Name, Description, Subdomain, Domain, Status, IsActive, ContactEmail, CreatedAt, UpdatedAt)
VALUES ('00000000-0000-0000-0000-000000000001', 'System Admin', 'System administration tenant', 'admin', 'admin.localhost', 0, 1, 'admin@system.com', GETUTCDATE(), GETUTCDATE());

-- Create Demo Tenant
INSERT INTO Tenants (Id, Name, Description, Subdomain, Domain, Status, IsActive, ContactEmail, CreatedAt, UpdatedAt)
VALUES ('00000000-0000-0000-0000-000000000002', 'Demo Salon', 'Demo tenant for testing', 'demo', 'demo.localhost', 0, 1, 'contact@demo.com', GETUTCDATE(), GETUTCDATE());

-- Create System Admin User
INSERT INTO Users (Id, Email, PasswordHash, PasswordSalt, FirstName, LastName, PhoneNumber, UserType, IsActive, CreatedAt, UpdatedAt, LastLoginAt, TenantId)
VALUES ('00000000-0000-0000-0000-000000000011', 'systemadmin@admin.localhost', @PasswordHash, 'SYSTEM_SALT', 'System', 'Administrator', '+1234567890', 'SystemAdmin', 1, GETUTCDATE(), GETUTCDATE(), NULL, '00000000-0000-0000-0000-000000000001');

-- Create Tenant Admin for Demo Tenant
INSERT INTO Users (Id, Email, PasswordHash, PasswordSalt, FirstName, LastName, PhoneNumber, UserType, IsActive, CreatedAt, UpdatedAt, LastLoginAt, TenantId)
VALUES ('00000000-0000-0000-0000-000000000012', 'admin@demo.localhost', @PasswordHash, 'DEMO_ADMIN_SALT', 'Demo', 'Admin', '+1234567891', 'TenantAdmin', 1, GETUTCDATE(), GETUTCDATE(), NULL, '00000000-0000-0000-0000-000000000002');

-- Create Service Provider for Demo Tenant
INSERT INTO Users (Id, Email, PasswordHash, PasswordSalt, FirstName, LastName, PhoneNumber, UserType, IsActive, CreatedAt, UpdatedAt, LastLoginAt, TenantId)
VALUES ('00000000-0000-0000-0000-000000000013', 'provider@demo.localhost', @PasswordHash, 'DEMO_PROVIDER_SALT', 'John', 'Stylist', '+1234567892', 'Provider', 1, GETUTCDATE(), GETUTCDATE(), NULL, '00000000-0000-0000-0000-000000000002');

-- Create Customer for Demo Tenant
INSERT INTO Users (Id, Email, PasswordHash, PasswordSalt, FirstName, LastName, PhoneNumber, UserType, IsActive, CreatedAt, UpdatedAt, LastLoginAt, TenantId)
VALUES ('00000000-0000-0000-0000-000000000014', 'customer@demo.localhost', @PasswordHash, 'DEMO_CUSTOMER_SALT', 'Jane', 'Doe', '+1234567893', 'Customer', 1, GETUTCDATE(), GETUTCDATE(), NULL, '00000000-0000-0000-0000-000000000002');

-- Create Service Category for Demo Tenant
INSERT INTO ServiceCategories (Id, Name, Description, ParentCategoryId, IconUrl, SortOrder, IsActive, CreatedAt, UpdatedAt, TenantId)
VALUES ('00000000-0000-0000-0000-000000000021', 'Hair Services', 'Professional hair styling services', NULL, 'hair-icon.png', 1, 1, GETUTCDATE(), GETUTCDATE(), '00000000-0000-0000-0000-000000000002');

-- Create Service for Demo Tenant
INSERT INTO Services (Id, Name, Description, CategoryId, ProviderId, TenantId, Duration, Price, Currency, IsActive, CreatedAt, UpdatedAt, IsFeatured, MaxBookingsPerDay)
VALUES ('00000000-0000-0000-0000-000000000031', 'Haircut & Styling', 'Professional haircut and styling service', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000002', 60, 75.00, 'USD', 1, GETUTCDATE(), GETUTCDATE(), 1, 8);

-- Create Slot for Demo Service
INSERT INTO Slots (Id, ServiceId, StartDateTime, EndDateTime, MaxBookings, AvailableBookings, IsAvailable, CreatedAt, UpdatedAt, IsRecurring)
VALUES ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000031', DATEADD(day, 1, GETUTCDATE()), DATEADD(hour, 1, DATEADD(day, 1, GETUTCDATE())), 1, 1, 1, GETUTCDATE(), GETUTCDATE(), 0);

-- Create Global Settings
INSERT INTO GlobalSettings (Id, MaintenanceMode, DefaultTimezone, MaxUsersPerTenant, MaxAppointmentsPerTenant, CreatedAt, UpdatedAt)
VALUES ('00000000-0000-0000-0000-000000000051', 0, 'UTC', 1000, 10000, GETUTCDATE(), GETUTCDATE());

-- Create Default Pricing Plan
INSERT INTO PricingPlans (Id, Name, Description, Price, Currency, Interval, Status, CreatedDate, UpdatedDate)
VALUES ('00000000-0000-0000-0000-000000000061', 'Basic Plan', 'Basic subscription plan for small businesses', 29.99, 'USD', 'month', 0, GETUTCDATE(), GETUTCDATE());

PRINT 'Database seeding completed successfully!';
PRINT 'System Admin: systemadmin@admin.localhost / Happy@123';
PRINT 'Demo Admin: admin@demo.localhost / Happy@123';
PRINT 'Demo Provider: provider@demo.localhost / Happy@123';
PRINT 'Demo Customer: customer@demo.localhost / Happy@123';
</content>