using Microsoft.Extensions.DependencyInjection;
using MediatR;
using MassTransit;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Prometheus;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Metrics;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog.Formatting.Compact;
using Serilog.Events;
using Microsoft.Extensions.Configuration;
using UserService.Services;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using FluentValidation;
using FluentValidation.AspNetCore;
using Consul;
using Shared.Consul;
using ConfigurationService.Services;
using PaymentService.Services;

namespace UserService;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddFluentValidationAutoValidation();
        builder.Services.AddFluentValidationClientsideAdapters();
        builder.Services.AddValidatorsFromAssemblyContaining<Validators.LoginRequestValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<Validators.RegisterProviderRequestValidator>();
        builder.Services.AddEndpointsApiExplorer();

        // Health checks
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => new HealthCheckResult(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy, "A healthy check result."));

        // MediatR
        builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

        // MassTransit
        builder.Services.AddMassTransit(x =>
        {
            x.AddConsumer<Consumers.UserRegisteredConsumer>();
            
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host("localhost", "/", h =>
                {
                    h.Username("guest");
                    h.Password("guest");
                });
                
                cfg.ReceiveEndpoint("user-events", e =>
                {
                    e.ConfigureConsumer<Consumers.UserRegisteredConsumer>(context);
                });
            });
        });

        // Register dependencies with proper service lifetimes
        builder.Services.AddScoped<Processors.JwtService>(sp =>
            new Processors.JwtService(sp.GetRequiredService<IConfiguration>(), sp.GetRequiredService<ILogger<Processors.JwtService>>()));
        builder.Services.AddScoped<Processors.TokenService>(sp =>
            new Processors.TokenService(sp.GetRequiredService<ILogger<Processors.TokenService>>()));
        builder.Services.AddScoped<Shared.Contracts.IUserService, UserService.Services.UserService>();
        builder.Services.AddScoped<Shared.Contracts.IAuthenticationService, UserService.Services.AuthenticationService>();
        builder.Services.AddScoped<UserService.Utils.ITenantResolutionService, UserService.Utils.TenantResolutionService>();
        builder.Services.AddScoped<IRegistrationService, RegistrationService>();
        builder.Services.AddScoped<ITenantService, TenantService>();
        builder.Services.AddScoped<Shared.Contracts.IUserNotificationService, UserNotificationService>();
        
        // Add references to external services
        builder.Services.AddScoped<ConfigurationService.Services.ISubscriptionService, ConfigurationService.Services.SubscriptionService>();
        builder.Services.AddScoped<PaymentService.Services.IPaymentService, PaymentService.Services.PaymentService>();
        
        // Register the shared ApplicationDbContext
        builder.Services.AddDbContext<Shared.Data.ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Serilog configuration
        builder.Host.UseSerilog((context, configuration) =>
        {
            configuration
                .Enrich.FromLogContext()
                .Enrich.WithEnvironmentName()
                .Enrich.WithMachineName()
                .Enrich.WithProcessId();
            
            configuration
                .WriteTo.Console()
                .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(context.Configuration["Elasticsearch:Uri"] ?? "http://localhost:9200"))
                {
                    AutoRegisterTemplate = true,
                    IndexFormat = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name?.ToLower().Replace(".", "-")}-{context.HostingEnvironment.EnvironmentName?.ToLower().Replace(".", "-")}-{DateTime.UtcNow:yyyy-MM}"
                });
            configuration.ReadFrom.Configuration(context.Configuration);
        });
    
        // OpenTelemetry Tracing (updated API)
        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService("UserService"))
            .WithTracing(tracingBuilder =>
            {
                tracingBuilder
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation()
                    .AddSource("MassTransit") // MassTransit ActivitySource
                    .AddJaegerExporter();
            })
            .WithMetrics(metricsBuilder =>
            {
                metricsBuilder
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddMeter("MassTransit") // MassTransit Meter
                    .AddPrometheusExporter();
            });

        // Add Consul client and hosted service for registration
        builder.Services.AddSingleton<IConsulClient, ConsulClient>(p => new ConsulClient(cfg =>
        {
            cfg.Address = new Uri(builder.Configuration["Consul:Host"] ?? "http://localhost:8500");
        }));
        builder.Services.AddHostedService<Shared.Consul.ConsulRegisterService>();
    
        var app = builder.Build();

        // Configure the HTTP request pipeline.
        app.UseRouting();

        // Authentication and Authorization middleware should be in correct order
        app.UseMiddleware<Middleware.AuthenticationMiddleware>();
        app.UseAuthorization();
        //app.UseMiddleware<Middleware.AuthorizationMiddleware>();

        // Prometheus metrics endpoint
        app.UseOpenTelemetryPrometheusScrapingEndpoint();

        app.MapControllers();
        app.MapHealthChecks("/healthz");

        app.Run();
    }
}