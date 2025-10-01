using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Shared.Data;
using Shared.Models;
using Shared.Models.Enums;
using System;
using System.Linq;
using ServiceManagementService;

namespace ServiceManagementService.Tests
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove the app's ApplicationDbContext registration.
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add ApplicationDbContext using an in-memory database for testing.
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });

                var sp = services.BuildServiceProvider();

                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<ApplicationDbContext>();
                    db.Database.EnsureCreated();
                    SeedData(db).Wait(); // Seed data after ensuring creation
                }
            });
            
            // Configure test settings
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
            });
        }

        private async Task SeedData(ApplicationDbContext db)
        {
            // Clear existing data to ensure a clean state for each test run if needed
            db.Users.RemoveRange(db.Users);
            db.Services.RemoveRange(db.Services);
            await db.SaveChangesAsync();

            db.Users.Add(new User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-00000001"), // Consistent Admin ID
                Email = "admin@test.com",
                FirstName = "Admin", // Added missing property
                LastName = "User",   // Added missing property
                PasswordHash = "hashed_password", // Added missing property
                PasswordSalt = "salt", // Added missing property
                UserType = UserRole.Admin,
                TenantId = Guid.Parse("000000-0000-0000-0000-00000"), // Consistent Tenant ID
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            db.Users.Add(new User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-00000002"), // Consistent Provider ID
                Email = "provider@test.com",
                FirstName = "Provider", // Added missing property
                LastName = "User",   // Added missing property
                PasswordHash = "hashed_password", // Added missing property
                PasswordSalt = "salt", // Added missing property
                UserType = UserRole.Provider,
                TenantId = Guid.Parse("00000000-0000-0000-0000-00000000"), // Consistent Tenant ID
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}