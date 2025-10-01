using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Diagnostics;
using UserService.Utils;
using Microsoft.Extensions.Logging;

namespace UserService.Middleware;

public class AuthenticationMiddleware
{
    private static readonly ActivitySource ActivitySource = new ActivitySource("UserService.AuthenticationMiddleware");
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthenticationMiddleware> _logger;

    public AuthenticationMiddleware(RequestDelegate next, ILogger<AuthenticationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        using var activity = ActivitySource.StartActivity("AuthenticationMiddleware.InvokeAsync");
        
        LoggingExtensions.AddTraceIdToLogContext();
        
        try
        {
            // Check if the request has an authorization header
            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                context.Response.StatusCode = 401;
                activity?.SetStatus(ActivityStatusCode.Error);
                return;
            }

            // Token is valid, call the next middleware in the pipeline
            await _next(context);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication middleware execution.");
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
    }
}