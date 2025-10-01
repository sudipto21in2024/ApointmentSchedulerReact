using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Consul;
using Shared.Consul;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using ReportingService.Services;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System; // Added for Uri


namespace ReportingService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            
            // Add DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Register services
            builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();

            // Add health checks
            builder.Services.AddHealthChecks()
                 .AddCheck("self", () => new HealthCheckResult(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy, "A healthy check result."));

            // Add Consul client and hosted service for registration
            builder.Services.AddSingleton<IConsulClient, ConsulClient>(p => new ConsulClient(cfg =>
            {
                cfg.Address = new Uri(builder.Configuration["Consul:Host"] ?? "http://localhost:8500");
            }));
            builder.Services.AddHostedService<Shared.Consul.ConsulRegisterService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseAuthorization();
            app.MapControllers();
            app.MapHealthChecks("/healthz"); // Health check endpoint

            app.Run();
        }
    }
}