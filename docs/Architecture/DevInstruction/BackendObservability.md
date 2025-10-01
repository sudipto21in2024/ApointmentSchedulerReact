# Backend Observability in ASP.NET Core API

This document provides implementation details for the new observability infrastructure in the ASP.NET Core API. It is intended for AI coding agents and aims to explain how to instrument the code to collect metrics, logs, and traces.

## Key Components

The following components are used for observability in the backend:

*   **Prometheus:** Used for collecting metrics.
*   **Serilog:** Used for structured logging.
*   **OpenTelemetry:** Used for distributed tracing.
*   **APM Agent:** (If applicable) Used for application performance monitoring.

## Implementation Details

### Metrics

1.  **Install Prometheus NuGet package:** Add the `prometheus-net.AspNetCore` NuGet package to your ASP.NET Core API project.
2.  **Expose metrics endpoint:** Add the following code to your `Startup.cs` file to expose the `/metrics` endpoint:

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ...
    app.UseMetricServer();
    app.UseHttpMetrics();
    // ...
}
```

3.  **Collect custom metrics:** Use the `prometheus-net` client library to collect custom metrics in your application code.

### Logging

1.  **Install Serilog NuGet packages:** Add the following NuGet packages to your ASP.NET Core API project:
    *   `Serilog.AspNetCore`
    *   `Serilog.Sinks.Elasticsearch`
2.  **Configure Serilog:** Configure Serilog in your `Program.cs` file to log to Elasticsearch:

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .UseSerilog((context, configuration) =>
        {
            configuration
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .WriteTo.Console()
                .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(context.Configuration["Elasticsearch:Uri"]))
                {
                    AutoRegisterTemplate = true,
                    IndexFormat = $"{Assembly.GetExecutingAssembly().GetName().Name.ToLower().Replace(".", "-")}-{context.HostingEnvironment.EnvironmentName?.ToLower().Replace(".", "-")}-{DateTime.UtcNow:yyyy-MM}"
                })
                .ReadFrom.Configuration(context.Configuration);
        })
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
        });
```

3.  **Log messages:** Use the `ILogger` interface to log messages in your application code.

### Tracing

1.  **Install OpenTelemetry NuGet packages:** Add the following NuGet packages to your ASP.NET Core API project:
    *   `OpenTelemetry.AspNetCore`
    *   `OpenTelemetry.Exporter.Jaeger`
    *   `OpenTelemetry.Extensions.Hosting`
2.  **Configure OpenTelemetry:** Configure OpenTelemetry in your `Startup.cs` file to export traces to Jaeger:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddOpenTelemetryTracing((builder) =>
    {
        builder.AddAspNetCoreInstrumentation()
               .AddJaegerExporter(options =>
               {
                   options.AgentHost = "localhost";
                   options.AgentPort = 6831;
               });
    });
    // ...
}
```

3.  **Create spans:** Use the `Activity` class to create spans in your application code.

## Further Documentation

*   [prometheus-net.AspNetCore](https://github.com/PrometheusNet/prometheus-net)
*   [Serilog](https://serilog.net/)
*   [OpenTelemetry](https://opentelemetry.io/)
*   [Elastic APM](https://www.elastic.co/guide/en/apm/agent/dotnet/current/index.html)

## Sample Code Examples

### Logging with Serilog

```csharp
// Use case: Logging an information message
_logger.LogInformation("User {UserId} logged in successfully", userId);

// Use case: Logging an error with exception details
try
{
    // Some code that may throw an exception
}
catch (Exception ex)
{
    _logger.LogError(ex, "An error occurred while processing request");
}
```

### Metrics with Prometheus

```csharp
// Use case: Incrementing a counter
private static readonly Counter _requestsCounter = Metrics.CreateCounter("myapp_requests_total", "Total number of requests.");

_requestsCounter.Inc();

// Use case: Observing a histogram
private static readonly Histogram _responseTimes = Metrics.CreateHistogram("myapp_response_time_seconds", "Response time in seconds.");

using (_responseTimes.NewTimer())
{
    // Code to measure
}
```

### Tracing with OpenTelemetry

```csharp
// Use case: Creating a custom span
using (var activity = ActivitySource.StartActivity("ProcessOrder"))
{
    activity?.SetTag("order.id", orderId);
    // ...
}
```

## Wrapper Functions for Easy Implementation

To simplify the implementation of observability for junior developers, you can create wrapper functions for logging, metrics, and tracing.

### Logging Wrapper

```csharp
public static class LogHelper
{
    public static void LogInformation(ILogger logger, string message, params object[] args)
    {
        logger.LogInformation(message, args);
    }

    public static void LogError(ILogger logger, Exception ex, string message, params object[] args)
    {
        logger.LogError(ex, message, args);
    }
}
```

### Metrics Wrapper

```csharp
public static class MetricsHelper
{
    public static void IncrementCounter(Counter counter)
    {
        counter.Inc();
    }

    public static IDisposable ObserveHistogram(Histogram histogram)
    {
        return histogram.NewTimer();
    }
}
```

### Tracing Wrapper

```csharp
public static class TracingHelper
{
    public static IDisposable StartActivity(string name)
    {
        return ActivitySource.StartActivity(name);
    }
}
```

## Use Cases and Implementation

### API Request Monitoring

*   **Implementation:** Use the `HttpMetrics` middleware to collect metrics for API requests. Use Serilog to log request and response details. Use OpenTelemetry to trace requests as they propagate through the system.
*   **Code Solution:** (Already implemented by `UseHttpMetrics` and Serilog configuration)

### Business Logic Monitoring

*   **Implementation:** Use custom metrics to track key business metrics (e.g., number of orders processed, number of users registered). Use Serilog to log business events. Use OpenTelemetry to trace business transactions.
*   **Code Solution:**

```csharp
// Backend (ASP.NET Core API)
private static readonly Counter _ordersProcessed = Metrics.CreateCounter("myapp_orders_processed_total", "Total number of orders processed.");

public async Task<IActionResult> ProcessOrder(Order order)
{
    using (var activity = ActivitySource.StartActivity("ProcessOrder"))
    {
        _ordersProcessed.Inc();
        _logger.LogInformation("Processing order {OrderId}", order.Id);
        // ...
    }
}
```
</content>