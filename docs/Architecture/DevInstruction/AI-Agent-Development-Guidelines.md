# AI Agent Development Guidelines

## 1. Introduction

This document provides a comprehensive set of guidelines for AI coding agents working on this project. It covers best practices for project creation, common error resolution, security considerations, and code quality, aiming to ensure consistency, maintainability, and robustness across the codebase.

## 2. General Development Principles

Adherence to these principles is crucial for developing high-quality software:

*   **Consistency**: Always follow established patterns and conventions present in the existing codebase.
*   **Readability**: Write code that is easy to understand and self-documenting.
*   **SOLID Principles**: Apply Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
*   **DRY (Don't Repeat Yourself)**: Avoid code duplication through proper abstraction and modularization.
*   **YAGNI (You Aren't Gonna Need It)**: Implement only what is currently required by the task.
*   **Fail Fast**: Validate inputs and assumptions early, failing with clear and concise error messages.

## 3. Project Creation Guidance

When creating new projects (e.g., new services, test projects), follow these steps:

*   **Standard Project Setup**:
    *   For new ASP.NET Core Web APIs: `dotnet new webapi -n YourService -o backend/services/YourService`
    *   For new xUnit test projects: `dotnet new xunit -n YourService.Tests -o tests/YourService.Tests`
*   **Adding Project References**:
    *   Use `dotnet add <referencing-project.csproj> reference <referenced-project.csproj>` to establish project dependencies. For example, a test project will reference the service project it tests, and a service project might reference the `shared` project.
*   **Adding NuGet Package References**:
    *   Use `dotnet add <project.csproj> package <PackageName> --version <VersionNumber>` to add necessary NuGet packages. Ensure versions are consistent with other projects where possible.
*   **Initial File Structure and Cleanup**:
    *   After creating a new project, remove any default generated files that are not needed (e.g., `WeatherForecast.cs`, `WeatherForecastController.cs` for webapi projects).
    *   Place newly created files (controllers, services, validators) in their appropriate, logical subdirectories within the project.
    *   **New**: Remember to explicitly install missing SDKs (e.g., .NET 9.0) if a project targets a newer framework.
*   **Adding to Solution**:
    *   Always add new projects to the main solution file: `dotnet sln <solution-file.sln> add <project.csproj>`

### Detailed Step-by-Step Commands

#### 1. Create a new ASP.NET Core Web API Project:
```bash
dotnet new webapi -n YourService -o backend/services/YourService
```
*This command creates a new Web API project named `YourService` in the `backend/services/` directory.*

#### 2. Create a new xUnit Test Project:
```bash
dotnet new xunit -n YourService.Tests -o tests/YourService.Tests
```
*This command creates a new xUnit test project named `YourService.Tests` in the `tests/` directory.*

#### 3. Add Project Reference (e.g., Test Project to Service Project):
```bash
dotnet add tests/YourService.Tests/YourService.Tests.csproj reference backend/services/YourService/YourService.csproj
```
*This command adds a project reference from `YourService.Tests.csproj` to `YourService.csproj`.*

#### 4. Add Project Reference (e.g., Service Project to Shared Project):
```bash
dotnet add backend/services/YourService/YourService.csproj reference shared/Shared.csproj
```
*This command adds a project reference from `YourService.csproj` to `shared/Shared.csproj`.*

#### 5. Add NuGet Package Reference:
```bash
dotnet add backend/services/YourService/YourService.csproj package <PackageName> --version <VersionNumber>
```
*This command adds a NuGet package reference with a specific version to `YourService.csproj`. Replace `<PackageName>` and `<VersionNumber>` accordingly.*

#### 6. Add Project to Solution File:
```bash
dotnet sln backend/AppointmentBooking.sln add backend/services/YourService/YourService.csproj
```
*This command adds the newly created `YourService.csproj` to the `AppointmentBooking.sln` solution file.*

#### 7. Create a new file (e.g., a service interface):
```bash
# First, ensure the directory exists
mkdir -p backend/services/YourService/Services
# Then, create the file with content
write_to_file
<path>backend/services/YourService/Services/IYourService.cs</path>
<content>
using System.Threading.Tasks;

namespace YourService.Services
{
    public interface IYourService
    {
        Task<string> GetDataAsync();
    }
}
</content>
<line_count>8</line_count>
```
*This demonstrates how to create a new file with specific content. You would replace the path, content, and line count as needed.*

#### 8. Build the entire application:
```bash
dotnet build backend/AppointmentBooking.sln
```
*This command builds the entire solution, checking for compilation errors and warnings across all projects.*

## 4. Common Error Scenarios and Fixes

This section outlines common compilation errors and warnings encountered during development and how to resolve them.

### 4.1. Dependency Issues

*   **`NU1605`: Package Downgrade Warning (treated as Error)**
    *   **Cause**: Occurs when a project directly or indirectly references a lower version of a package than another dependency requires. Often happens when a common library (like `Shared.csproj`) specifies a newer version of a transitive dependency.
    *   **Fix**: Explicitly reference the higher required version of the package in the project that is reporting the downgrade. Use `dotnet add <project.csproj> package <PackageName> --version <HigherVersion>` to force the higher version.
*   **`NU1102`: Unable to Find Package**
    *   **Cause**: The specified package version is not available in the configured NuGet feeds. This can happen if a pre-release version is specified without the `--prerelease` flag, or if the version does not exist.
    *   **Fix**: Verify the package name and version. Check NuGet.org for available versions. If it's a pre-release, ensure the version string is exact (e.g., `1.6.0-rc.1`) and consider if it's appropriate for the project stability.
*   **`CS0246`: The type or namespace name 'X' could not be found**
    *   **Cause**: Missing `using` directive at the top of the file, or the required NuGet package/project reference is missing in the `.csproj` file.
    *   **Fix**:
        1.  Add the appropriate `using` directive (e.g., `using Microsoft.Extensions.Logging;`).
        2.  If the type is from a NuGet package, add the package reference to the `.csproj`.
        3.  If the type is from another project in the solution, add a project reference to the `.csproj`.

### 4.2. Async/Await Mismatches

These errors occur when the `async` and `await` keywords are used inconsistently, leading to interface/implementation mismatches or incorrect usage.

*   **`CS1998`: This async method lacks 'await' operators and will run synchronously.**
    *   **Cause**: A method is marked `async` but does not contain any `await` expressions.
    *   **Fix**:
        1.  If the method performs truly asynchronous operations (e.g., database calls, external API calls), ensure `await` is used for those operations.
        2.  If the method is always synchronous, remove the `async` keyword and change the return type from `Task<T>` to `T`, or from `Task` to `void` (for fire-and-forget scenarios), or return `Task.CompletedTask` if an `async` signature is strictly required (e.g., by an interface).
*   **`CS1061`: 'X' does not contain a definition for 'GetAwaiter'**
    *   **Cause**: Attempting to `await` a method or property that does not return an awaitable type (e.g., `Task`, `Task<T>`, `ValueTask`, `ValueTask<T>`). This often happens after a method's signature has been changed from `async` to synchronous.
    *   **Fix**: Remove the `await` keyword if the method is now synchronous.
*   **`CS0738`: 'Class' does not implement interface member 'Interface.Method()'. 'Class.Method()' cannot implement 'Interface.Method()' because it does not have the matching return type of 'Task<T>' (or similar).**
    *   **Cause**: The method signature in the class implementation does not match the method signature in its interface. This frequently occurs when an `async` method in the interface is implemented synchronously in the class, or vice-versa.
    *   **Fix**: Ensure the return types (e.g., `Task<T>`, `T`, `bool`) and the presence/absence of `async` keyword are identical between the interface and the implementing class. Adjust both as necessary to reflect the true nature of the operation (I/O-bound async vs. CPU-bound sync).

### 4.3. Nullability Warnings

These warnings (`CS8600`, `CS8602`, `CS8604`, `CS8625`, `CS8620`) are related to C# 8.0's nullable reference types and indicate potential `null` dereferences.

*   **Fix**:
    1.  **Null Checks**: Add explicit `if (variable == null)` checks before dereferencing potentially null variables.
    2.  **Null-Forgiving Operator (`!`):** Use `variable!` when you are certain a variable is not null, but the compiler cannot infer it. Use sparingly.
    3.  **Null-Coalescing Operator (`??`):** Use `variable ?? defaultValue` to provide a default value if `variable` is null.
    4.  **Nullable Types (`?`):** Mark types as nullable (e.g., `string?`, `User?`) if they are genuinely intended to hold null values. Ensure parameters are marked nullable if they can accept null arguments.

### 4.4. Unused Variables

*   **`CS0168`: The variable 'ex' is declared but never used**
    *   **Cause**: An exception variable in a `catch` block is declared but its value is not used (e.g., not logged, not rethrown with additional context).
    *   **Fix**: Always log exceptions in `catch` blocks using an `ILogger` instance. If logging is not desired or the exception is handled differently, consider removing the `ex` variable if it's truly not needed, or replace `catch (Exception ex)` with `catch (Exception)` if the exception details are irrelevant.

### 4.5. xUnit Warnings

*   **`xUnit1013`: Public method 'Dispose' on test class 'X' should be marked as a Fact.**
    *   **Cause**: A public method named `Dispose` is present in a test class, but it's not a test method (lacks `[Fact]` or similar attribute). This usually occurs when implementing `IDisposable` for test cleanup.
    *   **Fix**: Ensure the test class implements `IDisposable` and the `Dispose()` method is correctly defined as a public method required by the interface. Test runners will call this method automatically for cleanup. Do NOT mark `Dispose` with `[Fact]`.

## 5. Security Considerations

*   **Vulnerable NuGet Packages (`NU1902` warnings):**
    *   Always aim to update packages to versions that do not have reported vulnerabilities.
    *   If a direct upgrade is not possible (e.g., due to compatibility issues with the target framework), investigate the specific vulnerability to assess its impact on the project. Document the decision to use a vulnerable version and any mitigating controls.
    *   Regularly review project dependencies for new vulnerabilities.
*   **Input Validation:** Implement robust input validation at API boundaries and critical business logic layers to prevent injection attacks (SQL Injection, XSS, etc.). Utilize data annotations, FluentValidation, or custom validation logic.
*   **Sensitive Data Handling:** Ensure sensitive data (e.g., passwords, API keys, personal identifiable information) is never hardcoded, logged inadvertently, or exposed in error messages. Use secure configuration management (e.g., Azure Key Vault, environment variables) for secrets.
*   **Authentication and Authorization:** Implement proper authentication and authorization mechanisms (e.g., JWT tokens, role-based access control, claims-based authorization) to restrict access to resources based on user identity and permissions.

## 6. Code Quality Guidelines

*   **Logging Best Practices:**
    *   Inject `ILogger<T>` into classes that perform logging.
    *   Use appropriate log levels (`LogInformation`, `LogWarning`, `LogError`, etc.).
    *   Include contextual information (e.g., user ID, request ID, email) in log messages for easier debugging and tracing.
    *   Log exceptions with the full exception object (`_logger.LogError(ex, "Message")`).
*   **Test Structure and Setup:**
    *   Organize tests into Unit, Integration, and E2E categories.
    *   For unit tests, use in-memory databases (e.g., `Microsoft.EntityFrameworkCore.InMemory`) or mocking frameworks (e.g., Moq) to isolate the code under test and ensure fast, repeatable tests.
    *   Follow the Arrange-Act-Assert pattern.
*   **Code Formatting and Style:** Adhere to the standards outlined in `docs/Architecture/DevInstruction/aspnet-coding-standards.md` for consistent code appearance. This includes naming conventions, indentation, and brace style.
*   **Modularity and Separation of Concerns:** Design components with clear responsibilities. Separate business logic from data access and presentation layers.
*   **Performance:**
    *   Favor asynchronous programming (`async`/`await`) for I/O-bound operations.
    *   Optimize database queries (e.g., eager loading with `Include`, projection with `Select`, pagination).
    *   Consider caching strategies for frequently accessed data.
*   **Documentation:** Provide clear XML documentation for public APIs (classes, methods, properties) and complex logic.

## 7. Troubleshooting

*   **Read Build Output Carefully**: The build output provides valuable clues. Look for the first error and address it, as subsequent errors might be a cascade effect.
*   **Check `.csproj` Files**: Verify project references and NuGet package references for correctness and version consistency.
*   **Review Interfaces and Implementations**: Ensure method signatures (return types, parameters, `async` keyword) match exactly between interfaces and their implementations.
*   **Step-Through Debugging**: Use the debugger to step through code execution and inspect variable states.
*   **Consult Existing Code**: Refer to existing, working code for examples of how similar functionalities are implemented.

## 8. Change Log
### 2025-09-17
- **Change Description:** Documented common error scenarios and their fixes encountered during implementation of Notification Service features (BE-011). Added guidance on `xUnit1013` warnings.
- **Reason:** To provide concrete guidance for AI agents on how to resolve frequently occurring build errors and warnings, improving development efficiency.
- **Affected Components:** General development practices, all service projects.
### 2025-09-17
- **Change Description:** Added detailed step-by-step commands for project creation, adding references, creating files, and building the solution.
- **Reason:** To assist AI agents in common project setup and build tasks, particularly to address issues with project references and build failures.
- **Affected Components:** Project creation and management, build processes.

---

*This document is a living guide and will be updated as new best practices emerge or project requirements evolve.*