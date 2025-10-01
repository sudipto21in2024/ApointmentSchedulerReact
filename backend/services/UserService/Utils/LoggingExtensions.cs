using System.Diagnostics;
using Serilog.Context;

namespace UserService.Utils
{
    public static class LoggingExtensions
    {
        /// <summary>
        /// Adds the current trace ID to the log context for correlation between logs and traces
        /// </summary>
        public static void AddTraceIdToLogContext()
        {
            var activity = Activity.Current;
            if (activity != null && activity.Id != null)
            {
                LogContext.PushProperty("trace_id", activity.TraceId.ToString());
                LogContext.PushProperty("span_id", activity.SpanId.ToString());
            }
        }
        
        /// <summary>
        /// Gets the current trace ID if available
        /// </summary>
        /// <returns>Trace ID string or null if not available</returns>
        public static string? GetCurrentTraceId()
        {
            var activity = Activity.Current;
            return activity?.TraceId.ToString();
        }
    }
}