using System;
using System.Collections.Generic;

namespace Shared.DTOs
{
    /// <summary>
    /// DTO for system health monitoring including performance and error tracking
    /// </summary>
    public class SystemHealthDto
    {
        public SystemPerformanceDto Performance { get; set; } = new SystemPerformanceDto();
        public List<ErrorMetricDto> ErrorMetrics { get; set; } = new List<ErrorMetricDto>();
        public List<ServiceStatusDto> ServiceStatuses { get; set; } = new List<ServiceStatusDto>();
    }
    
    /// <summary>
    /// DTO for system performance metrics
    /// </summary>
    public class SystemPerformanceDto
    {
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public double DiskUsage { get; set; }
        public double NetworkLatency { get; set; }
        public int ActiveConnections { get; set; }
        public double AverageResponseTime { get; set; }
        public int RequestsPerSecond { get; set; }
    }
    
    /// <summary>
    /// DTO for error metrics
    /// </summary>
    public class ErrorMetricDto
    {
        public string ErrorType { get; set; } = string.Empty;
        public int ErrorCount { get; set; }
        public DateTime LastErrorTime { get; set; }
        public string LastErrorMessage { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// DTO for service status
    /// </summary>
    public class ServiceStatusDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime LastCheckTime { get; set; }
        public string Details { get; set; } = string.Empty;
    }
}