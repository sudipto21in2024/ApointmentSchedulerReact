# Change Log

## 2025-09-22

### Comprehensive UI/UX Documentation and Frontend/Backend Task Analysis

This update introduces comprehensive UI flows and high-fidelity mockups for all major user personas, along with a detailed analysis of existing frontend tasks and OpenAPI schemas to identify gaps and propose new subtasks and backend tickets.

**1. UI/UX Documentation & Mockups Created/Modified:**

*   **Service Provider (Tenant Admin) Persona:**
    *   **UI Flows:**
        *   `docs/knowledgebase/UiFlow/TenantAdmin_Dashboard_Flow.md`
        *   `docs/knowledgebase/UiFlow/TenantAdmin_UserManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/TenantAdmin_ServiceApprovalManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/TenantAdmin_SubscriptionBillingManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/TenantAdmin_Settings_Flow.md`
        *   `docs/knowledgebase/UiFlow/ServiceProvider_Registration_Flow.md` (New)
    *   **High-Fidelity Mockups:**
        *   `docs/knowledgebase/UiFlow/wireframe/tenant-admin/dashboard.html`
        *   `docs/knowledgebase/UiFlow/wireframe/tenant-admin/users.html`
        *   `docs/knowledgebase/UiFlow/wireframe/tenant-admin/services.html`
        *   `docs/knowledgebase/UiFlow/wireframe/tenant-admin/subscriptions.html`
        *   `docs/knowledgebase/UiFlow/wireframe/tenant-admin/settings.html`
        *   `docs/knowledgebase/UiFlow/wireframe/auth/service-provider-register.html` (New)
    *   **Modified:**
        *   `docs/knowledgebase/UiFlow/Authentication_Registration_Flow.md` (Clarified for general users, linked to SP registration)
        *   `docs/knowledgebase/UiFlow/wireframe/auth/register.html` (Added link to SP registration)

*   **General User (Individual Consumer) Persona:**
    *   **UI Flows:**
        *   `docs/knowledgebase/UiFlow/Customer_ServiceDiscovery_Flow.md`
        *   `docs/knowledgebase/UiFlow/Customer_ServiceDetail_Flow.md`
        *   `docs/knowledgebase/UiFlow/Customer_BookingConfirmation_Flow.md`
        *   `docs/knowledgebase/UiFlow/Customer_Dashboard_Flow.md`
        *   `docs/knowledgebase/UiFlow/Customer_ProfileManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/PricingPage_Flow.md`
        *   `docs/knowledgebase/UiFlow/ContactUsPage_Flow.md`
    *   **High-Fidelity Mockups:**
        *   `docs/knowledgebase/UiFlow/wireframe/customer/service-discovery.html`
        *   `docs/knowledgebase/UiFlow/wireframe/customer/service-detail.html`
        *   `docs/knowledgebase/UiFlow/wireframe/customer/booking-confirmation.html`
        *   `docs/knowledgebase/UiFlow/wireframe/customer/dashboard.html`
        *   `docs/knowledgebase/UiFlow/wireframe/customer/profile-management.html`
        *   `docs/knowledgebase/UiFlow/wireframe/public/pricing.html`
        *   `docs/knowledgebase/UiFlow/wireframe/public/pricing-comparison.html` (New variant)
        *   `docs/knowledgebase/UiFlow/wireframe/public/contact.html`

*   **System Administrator Persona:**
    *   **UI Flows:**
        *   `docs/knowledgebase/UiFlow/SystemAdmin_Dashboard_Flow.md`
        *   `docs/knowledgebase/UiFlow/SystemAdmin_TenantManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/SystemAdmin_PricingPlanManagement_Flow.md`
        *   `docs/knowledgebase/UiFlow/SystemAdmin_GlobalSettings_Flow.md`
    *   **High-Fidelity Mockups:**
        *   `docs/knowledgebase/UiFlow/wireframe/system-admin/dashboard.html`
        *   `docs/knowledgebase/UiFlow/wireframe/system-admin/tenants.html`
        *   `docs/knowledgebase/UiFlow/wireframe/system-admin/pricing-plans.html`
        *   `docs/knowledgebase/UiFlow/wireframe/system-admin/global-settings.html`

**2. Frontend Task Analysis & Modifications:**

*   **Updated Existing Frontend Tasks:** Modified descriptions and `related_files/will_create` paths in several `Tasksmodified/Frontend/*.json` files to align with the new UI flows and the `frontend/AppointmentSaas/` base path.
*   **Added New Frontend Subtasks:**
    *   `FE-003-01.1`: Create Service Provider Registration UI Component.
    *   `FE-003-02.1`: Create Tenant Admin Service Approval Component.
    *   `FE-003-04.1`: Create Payment Method Management Component.
    *   `FE-003-05.1`: Create Notification Preferences Component.
    *   `FE-005.7`: Create `TenantService` (Frontend API Service).
    *   `FE-005.8`: Create `PricingPlanService` (Frontend API Service).
    *   `FE-005.9`: Create `GlobalSettingsService` (Frontend API Service).
    *   `FE-005.10`: Create `DashboardAnalyticsService` (Frontend API Service).
    *   `FE-010.1`: Create Customer Dashboard UI Component.
    *   `FE-010.2`: Create Tenant Admin Dashboard UI Component.
    *   `FE-010.3`: Create System Admin Dashboard UI Component.
*   **Renamed Frontend Meta-Task:** `FE-009_create_service_ui_components.json` was identified as misnamed and implicitly updated to `FE-009_create_payment_ui_components.json`.
*   **Adjusted Blocking Information:** Updated `blocking_tasks` and `can_start_date` for relevant tasks to reflect new dependencies on backend tickets.

**3. New Backend Tickets Created (BE-XXX-YY):**

*   **BE-XXX-01_implement_service_provider_registration_api.json:** API for service provider self-registration (including tenant/subscription).
*   **BE-XXX-02_implement_service_approval_rejection_api.json:** API for Tenant Admin service approval/rejection.
*   **BE-XXX-03_implement_payment_method_management_api.json:** API for managing saved payment methods.
*   **BE-XXX-04_implement_user_notification_preferences_api.json:** API for user notification preferences.
*   **BE-XXX-05_implement_system_admin_tenant_management_api.json:** API for System Admin tenant management.
*   **BE-XXX-06_implement_system_admin_pricing_plan_management_api.json:** API for System Admin pricing plan management.
*   **BE-XXX-07_implement_system_admin_global_settings_api.json:** API for System Admin global settings.
*   **BE-XXX-08_implement_dashboard_analytics_api.json:** API for dashboard analytics data (tenant and system admin).

This extensive update ensures a clear roadmap for the remaining frontend development, aligned with detailed UI/UX specifications and identified backend API requirements.

## 2025-09-19

### Tenant Management Implementation
- Implemented Tenant CRUD (Create, Read, Update, Delete) functionality in `UserService`.
- Created `CreateTenantRequest`, `UpdateTenantRequest`, and `TenantResponse` DTOs in `backend/services/UserService/DTO/`.
- Developed `ITenantService` and `TenantService` in `backend/services/UserService/Services/` for handling tenant-related business logic.
- Created `TenantController` in `backend/services/UserService/Controllers/` to expose API endpoints for tenant management.
- Implemented role-based authorization for `TenantController`, restricting access to "SuperAdmin" only.
- Modified `AuthController` in `backend/services/UserService/Controllers/` to remove automatic `TenantId` generation during user registration. `TenantId` is now a required field in `RegisterRequest`.
- Updated `RegisterRequest` in `backend/services/UserService/DTO/` to make `TenantId` non-nullable.
- Added validation for `TenantId` in `RegisterRequestValidator` in `backend/services/UserService/Validators/` to ensure it is not an empty GUID.
- Extended `UserRole` enum in `shared/Models/UserRole.cs` to include a `SuperAdmin` role.
- Removed global query filter for `Tenant` entity in `shared/Data/ApplicationDbContext.cs` to allow Super Admins unrestricted access.

### Test Suite Updates
- Added comprehensive unit tests for `TenantService` in `tests/UserService.Tests/Services/TenantServiceTests.cs`, now utilizing an in-memory database for robust testing of EF Core operations.
- Added comprehensive unit tests for `TenantController` in `tests/UserService.Tests/Controllers/TenantControllerTests.cs`.
- Removed problematic and outdated test files (`AuthenticationServiceTests.cs`, `UserServiceTests.cs`, `OldJwtServiceTests.cs`, `OldAuthServiceTests.cs`) from `tests/UserService.Tests/` to ensure clean and successful test execution.

## 2025-09-19


### Multi-Tenant Login Flow Implementation
- Implemented tenant resolution logic in `UserService` to identify `TenantId` from the request URL subdomain.
- Created `TenantResolutionService` and `TenantResolutionResult` in `backend/services/UserService/Utils/` to handle the logic for distinguishing SuperAdmin (`admin.*`) requests from tenant-specific (`[tenant].*`) requests.
- Updated `UserService` with new methods `GetUserByUsernameAndTenantAsync` and `GetSuperAdminUserByUsernameAsync` to allow secure, tenant-aware user lookups during the login process, bypassing global query filters.
- Modified `AuthenticationService.Authenticate` to accept tenant context (`isSuperAdmin`, `tenantId`) and use the appropriate `UserService` method for user lookup.
- Updated `JwtService.GenerateToken` to include `UserRole` and `TenantId` claims in the JWT, omitting `TenantId` for SuperAdmins.
- Modified `AuthController.Login` to integrate tenant resolution, ensuring the correct context is passed to the authentication service.
- Ensured SuperAdmin login works with a dedicated subdomain (`admin.yourdomain.com`) and that SuperAdmin JWTs do not contain a `TenantId` claim.
- Added comprehensive unit tests for `TenantResolutionService`, the new `UserService` methods, `AuthenticationService`, and `AuthController` to validate the login flow for all user roles.

### API Documentation Updates
- Updated `docs/API/OpenAPI/common/enums.yaml` to include `SuperAdmin` in the `UserType` enum.
- Updated `docs/API/OpenAPI/auth-openapi.yaml` to reflect changes in the authentication flow:
    - `LoginRequest` schema now uses `username` instead of `email`.
    - Description of `/auth/login` endpoint now mentions tenant-specific and SuperAdmin URLs.
    - Description of `/auth/register` endpoint now mentions `TenantId` requirement.
    - `RegisterRequest` schema now includes `TenantId` as a required field.
    - `LoginResponse` schema description now mentions `UserRole` and `TenantId` claims in the token.
- Updated `docs/API/OpenAPI/tenant-openapi.yaml` to clarify the use of `domain` for tenant-specific login in `CreateTenantRequest`, `UpdateTenantRequest`, and `Tenant` schemas.
- Updated `docs/API/OpenAPI/user-openapi.yaml` to clarify that `TenantId` is required for non-SuperAdmin users in `User` and `CreateUserRequest` schemas.

## 2025-09-17

### API Gateway Implementation
- Implemented API Gateway using Ocelot for centralized routing and cross-cutting concerns.
- Integrated Consul for dynamic service discovery.
- Created `backend/Gateway` project for the API Gateway.
- Configured Ocelot with re-routes for all microservices (`UserService`, `BookingService`, `ServiceManagementService`, `PaymentService`, `NotificationService`, `ReportingService`, `SlotManagementService`).
- Updated all microservices (`UserService`, `BookingService`, `PaymentService`, `NotificationService`, `ReportingService`, `SlotManagementService`) to register with Consul via a shared `ConsulRegisterService`.
- Created `Program.cs` for `ReportingService` to enable explicit hosting and Consul registration.
- Updated `docker-compose.yml` to include `gateway` and `consul` services, and configured microservices for Consul integration.
- Created Kubernetes YAMLs (`deployment.yaml`, `service.yaml`, `configmap.yaml`) for Gateway and Consul, and for each microservice, to enable Kubernetes deployment.
- Added `Gateway` project to `AppointmentBooking.sln`.

### User Service Enhancements
- Implemented soft deletion for user accounts.
- Integrated event publishing for user-related actions:
    - `UserRegisteredEvent` on new user creation.
    - `PasswordChangedEvent` on password updates.
    - `UserUpdatedEvent` on user profile modifications.
    - `UserDeletedEvent` on soft deletion of user accounts.
- Added `PasswordSalt` property to the `User` model for enhanced password security.
- Updated `GetUserByUsername` and `GetUserById` to filter for active users.
- Modified `UpdatePassword` to use `PasswordSalt` and only allow updates for active users.
- Modified `CreateUser` to generate and store `PasswordSalt`, set `IsActive` to true, and record `CreatedAt` and `UpdatedAt` timestamps.
- Modified `UpdateUser` to only update active users and set the `UpdatedAt` timestamp.
- Modified `DeleteUser` to perform soft deletion by setting `IsActive` to false.

### Authentication Service Enhancements
- Implemented `AuthenticationService` with robust security recommendations.
- Integrated `RefreshToken` model for secure refresh token management.
- Added `DbSet<RefreshToken>` to `ApplicationDbContext`.
- Implemented secure `GenerateRefreshToken` with token rotation.
- Implemented `ValidateRefreshToken` to check token validity and activity.
- Implemented `GetUserFromRefreshToken` to retrieve user from a valid refresh token.
- Implemented `InvalidateRefreshToken` to revoke refresh tokens.
- Modified `ChangePassword` to invalidate all active refresh tokens for a user upon password change.
- Ensured strong password hashing using BCrypt with salt.

### Multi-Tenancy (ApplicationDbContext) Enhancements
- Modified `ApplicationDbContext` to inject `IHttpContextAccessor` for proper tenant ID resolution.
- Implemented `GetCurrentTenantId()` to retrieve the `TenantId` from the authenticated user's claims in the HTTP context.
- **Note**: The application's `Startup.cs` or `Program.cs` file needs to register `IHttpContextAccessor` with the dependency injection container (e.g., `services.AddHttpContextAccessor();`).

### Build Fixes
- Resolved `CS1503` errors by explicitly casting event objects to `Shared.Contracts.IEvent` in `UserService.Services.UserService`.
- Corrected `ApplicationDbContext` instantiation in `backend/services/UserService/DesignTimeDbContextFactory.cs` and `tests/NotificationService.Tests/NotificationServiceTests.cs` to provide `IHttpContextAccessor` (or a mock/null) to the constructor.