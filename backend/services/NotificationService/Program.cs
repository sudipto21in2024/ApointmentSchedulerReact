using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService.Services;
using NotificationService.Validators;
using Shared.Data;
using Hangfire;
using Hangfire.SqlServer;
using MassTransit; // Add MassTransit namespace
using NotificationService.Consumers; // Add consumer namespace
using Consul; // Add Consul namespace
using Shared.Consul; // Use the shared Consul service

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Hangfire services.
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("HangfireConnection")));

// Add the processing server as IHostedService
builder.Services.AddHangfireServer();

// Register custom services and validators
builder.Services.AddScoped<INotificationService, NotificationService.Services.NotificationService>();
builder.Services.AddScoped<INotificationValidator, NotificationValidator>();
builder.Services.AddSingleton<ITemplateRendererService, TemplateRendererService>(); // Singleton as RazorLightEngine is thread-safe

// MassTransit Configuration
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<TemplateNotificationConsumer>(); // Register the consumer

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ReceiveEndpoint("template-notification-events", e =>
        {
            e.ConfigureConsumer<TemplateNotificationConsumer>(context);
        });
    });
});

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
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Add Hangfire Dashboard
app.UseHangfireDashboard();

app.MapControllers();

app.Run();