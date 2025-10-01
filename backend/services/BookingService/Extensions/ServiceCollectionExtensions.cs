using Microsoft.Extensions.DependencyInjection;
using BookingService.Services;
using Shared.Data;
using Microsoft.Extensions.Logging;

namespace BookingService.Extensions
{
    /// <summary>
    /// Extension methods for configuring services in the BookingService
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds booking services to the service collection
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection</returns>
        public static IServiceCollection AddBookingServices(this IServiceCollection services)
        {
            // Register the booking service implementation
            services.AddScoped<IBookingService, BookingServiceImpl>();
            
            // Register the slot service implementation
            services.AddScoped<ISlotService, SlotService>();
            
            return services;
        }
    }
}