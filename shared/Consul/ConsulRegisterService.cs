using Consul;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Sockets;

namespace Shared.Consul;

public class ConsulRegisterService : IHostedService
{
    private readonly IConsulClient _consulClient;
    private readonly ILogger<ConsulRegisterService> _logger;
    private readonly IConfiguration _configuration;
    private string _registrationId;

    public ConsulRegisterService(IConsulClient consulClient, ILogger<ConsulRegisterService> logger, IConfiguration configuration)
    {
        _consulClient = consulClient;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var serviceName = _configuration["Consul:ServiceName"];
        var serviceId = $"{serviceName}-{Guid.NewGuid()}";
        var servicePort = _configuration.GetValue<int>("ASPNETCORE_HTTP_PORT"); // Use ASPNETCORE_HTTP_PORT
        var serviceAddress = GetLocalIPAddress(); // Get local IP address

        _registrationId = serviceId;

        var registration = new AgentServiceRegistration()
        {
            ID = serviceId,
            Name = serviceName,
            Address = serviceAddress,
            Port = servicePort,
            Tags = new[] { serviceName },
            Check = new AgentServiceCheck()
            {
                HTTP = $"http://{serviceAddress}:{servicePort}/healthz", // Use /healthz endpoint
                Interval = TimeSpan.FromSeconds(10),
                Timeout = TimeSpan.FromSeconds(5)
            }
        };

        _logger.LogInformation("Registering with Consul: {ServiceName} at {ServiceAddress}:{ServicePort}", serviceName, serviceAddress, servicePort);
        await _consulClient.Agent.ServiceDeregister(registration.ID, cancellationToken);
        await _consulClient.Agent.ServiceRegister(registration, cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deregistering from Consul: {RegistrationId}", _registrationId);
        await _consulClient.Agent.ServiceDeregister(_registrationId, cancellationToken);
    }

    private string GetLocalIPAddress()
    {
        var host = Dns.GetHostEntry(Dns.GetHostName());
        foreach (var ip in host.AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork)
            {
                return ip.ToString();
            }
        }
        throw new Exception("No network adapters with an IPv4 address in the system!");
    }
}