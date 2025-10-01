using System;
using System.Threading.Tasks;
using UserService.DTO;

namespace UserService.Services
{
    public interface IRegistrationService
    {
        Task<RegistrationResult> RegisterProviderAsync(RegisterProviderRequest request);
    }
}