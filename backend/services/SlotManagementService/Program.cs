using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using SlotManagementService.Services;
using SlotManagementService.Validators;
using Microsoft.Extensions.Configuration;
using Serilog;
using Consul;
using Shared.Consul; // Use the shared Consul service

namespace SlotManagementService
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure logging
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            // Add services to the container
            builder.Services.AddControllers();

            // Add DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add MassTransit
            builder.Services.AddMassTransit(x =>
            {
                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host("localhost", "/", h =>
                    {
                        h.Username("guest");
                        h.Password("guest");
                    });
                });
            });

            // Register services
            builder.Services.AddScoped<ISlotService, SlotService>();
            builder.Services.AddScoped<ISlotValidator, SlotValidator>();

            // Add health checks
            builder.Services.AddHealthChecks();

            // Add Consul client and hosted service for registration
            builder.Services.AddSingleton<IConsulClient, ConsulClient>(p => new ConsulClient(cfg =>
            {
                cfg.Address = new Uri(builder.Configuration["Consul:Host"] ?? "http://localhost:8500");
            }));
            builder.Services.AddHostedService<Shared.Consul.ConsulRegisterService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseAuthorization();
            app.MapControllers();
            app.MapHealthChecks("/health");

            await app.RunAsync();
        }
    }
}