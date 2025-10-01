using Microsoft.Extensions.DependencyInjection;
using PaymentService.Services;
using PaymentService.Validators;

namespace PaymentService.Extensions
{
    /// <summary>
    /// Extension methods for configuring services in the PaymentService
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds payment services to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection</returns>
        public static IServiceCollection AddPaymentServices(this IServiceCollection services)
        {
            // Register the payment service implementation
            services.AddScoped<IPaymentService, Services.PaymentService>();
            
            // Register the payment validator implementation
            services.AddScoped<IPaymentValidator, PaymentValidator>();
            
            return services;
        }
    }
}