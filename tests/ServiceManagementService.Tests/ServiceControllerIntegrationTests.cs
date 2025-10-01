// using System;
// using System.Net;
// using System.Net.Http;
// using System.Net.Http.Json;
// using System.Threading.Tasks;
// using Xunit;
// using Microsoft.AspNetCore.Mvc.Testing;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.DependencyInjection;
// using Shared.Data;
// using Shared.Models;
// using Shared.Models.Enums;
// using ServiceManagementService; // Assuming your Startup class is here
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Http;
// using Shared.DTOs;

// namespace ServiceManagementService.Tests.Integration
// {
//     public class ServiceControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly CustomWebApplicationFactory<Program> _factory;
//         private readonly HttpClient _client;
//         private readonly Guid _testTenantId = Guid.NewGuid();
//         private readonly Guid _testAdminId = Guid.NewGuid();
//         private readonly Guid _testProviderId = Guid.NewGuid();

//         public ServiceControllerIntegrationTests(CustomWebApplicationFactory<Program> factory)
//         {
//             _factory = factory;
//             _client = _factory.CreateClient();
            
//             // Seed data for this specific test class
//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var scopedServices = scope.ServiceProvider;
//                 var db = scopedServices.GetRequiredService<ApplicationDbContext>();
                
//                 // Ensure the database is created.
//                 db.Database.EnsureCreated();

//                 // Seed the database with test data.
//             }

//             _client = _factory.CreateClient();
//         }


//         [Fact]
//         public async Task ApproveService_ValidRequest_ReturnsOk()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Service to Approve",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = false,
//                 Status = ServiceStatus.Pending,
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsync($"/Service/{service.Id}/approve", null);

//             // Assert
//             response.EnsureSuccessStatusCode(); // Status Code 200-299
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service approved successfully.", responseContent["Message"]);

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 var updatedService = await db.Services.FindAsync(service.Id);
//                 Assert.NotNull(updatedService);
//                 Assert.True(updatedService.IsActive);
//                 Assert.Equal(ServiceStatus.Approved, updatedService.Status);
//             }
//         }

//         [Fact]
//         public async Task ApproveService_NonExistentService_ReturnsNotFound()
//         {
//             // Arrange
//             var nonExistentServiceId = Guid.NewGuid();

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsync($"/Service/{nonExistentServiceId}/approve", null);

//             // Assert
//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service not found.", responseContent["Message"]);
//         }

//         [Fact]
//         public async Task ApproveService_UnauthorizedUser_ReturnsForbidden()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Service to Approve",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = false,
//                 Status = ServiceStatus.Pending,
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             var nonAdminUserId = Guid.NewGuid();
//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Users.Add(new User
//                 {
//                     Id = nonAdminUserId,
//                     Email = "nonadmin@test.com",
//                     UserType = UserRole.Customer, // Not an admin
//                     TenantId = _testTenantId,
//                     IsActive = true,
//                     CreatedAt = DateTime.UtcNow,
//                     UpdatedAt = DateTime.UtcNow
//                 });
//                 await db.SaveChangesAsync();
//             }

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", nonAdminUserId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsync($"/Service/{service.Id}/approve", null);

//             // Assert
//             Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
//         }

//         [Fact]
//         public async Task ApproveService_ServiceNotPending_ReturnsBadRequest()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Approved Service",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = true,
//                 Status = ServiceStatus.Approved, // Already approved
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsync($"/Service/{service.Id}/approve", null);

//             // Assert
//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service is already Approved and cannot be approved.", responseContent["Message"]);
//         }

//         [Fact]
//         public async Task RejectService_ValidRequest_ReturnsOk()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Service to Reject",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = false,
//                 Status = ServiceStatus.Pending,
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             var rejectRequest = new RejectServiceRequest { Reason = "Does not meet quality standards." };

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsJsonAsync($"/Service/{service.Id}/reject", rejectRequest);

//             // Assert
//             response.EnsureSuccessStatusCode(); // Status Code 200-299
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service rejected successfully.", responseContent["Message"]);

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 var updatedService = await db.Services.FindAsync(service.Id);
//                 Assert.NotNull(updatedService);
//                 Assert.False(updatedService.IsActive);
//                 Assert.Equal(ServiceStatus.Rejected, updatedService.Status);
//                 Assert.Equal(rejectRequest.Reason, updatedService.RejectionReason);
//             }
//         }

//         [Fact]
//         public async Task RejectService_NonExistentService_ReturnsNotFound()
//         {
//             // Arrange
//             var nonExistentServiceId = Guid.NewGuid();
//             var rejectRequest = new RejectServiceRequest { Reason = "Test Reason" };

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsJsonAsync($"/Service/{nonExistentServiceId}/reject", rejectRequest);

//             // Assert
//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service not found.", responseContent["Message"]);
//         }

//         [Fact]
//         public async Task RejectService_UnauthorizedUser_ReturnsForbidden()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Service to Reject",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = false,
//                 Status = ServiceStatus.Pending,
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             var nonAdminUserId = Guid.NewGuid();
//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Users.Add(new User
//                 {
//                     Id = nonAdminUserId,
//                     Email = "nonadmin@test.com",
//                     UserType = UserRole.Customer, // Not an admin
//                     TenantId = _testTenantId,
//                     IsActive = true,
//                     CreatedAt = DateTime.UtcNow,
//                     UpdatedAt = DateTime.UtcNow
//                 });
//                 await db.SaveChangesAsync();
//             }

//             var rejectRequest = new RejectServiceRequest { Reason = "Test Reason" };

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", nonAdminUserId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsJsonAsync($"/Service/{service.Id}/reject", rejectRequest);

//             // Assert
//             Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
//         }

//         [Fact]
//         public async Task RejectService_ServiceNotPending_ReturnsBadRequest()
//         {
//             // Arrange
//             var service = new Service
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Approved Service",
//                 Description = "Description",
//                 CategoryId = Guid.NewGuid(),
//                 ProviderId = _testProviderId,
//                 TenantId = _testTenantId,
//                 Duration = 60,
//                 Price = 100m,
//                 Currency = "USD",
//                 IsActive = true,
//                 Status = ServiceStatus.Approved, // Already approved
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//                 db.Services.Add(service);
//                 await db.SaveChangesAsync();
//             }

//             var rejectRequest = new RejectServiceRequest { Reason = "Test Reason" };

//             // Act
//             _client.DefaultRequestHeaders.Add("X-User-Id", _testAdminId.ToString());
//             _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
//             var response = await _client.PutAsJsonAsync($"/Service/{service.Id}/reject", rejectRequest);

//             // Assert
//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//             var responseContent = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//             Assert.Contains("Service is already Approved and cannot be rejected.", responseContent["Message"]);
//         }
//     }
// }