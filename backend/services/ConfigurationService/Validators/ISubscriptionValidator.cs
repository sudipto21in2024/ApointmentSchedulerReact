using Shared.DTOs;
using System.Threading.Tasks;

namespace ConfigurationService.Validators
{
    public interface ISubscriptionValidator
    {
        Task ValidateCreateSubscriptionAsync(CreateSubscriptionDto dto);
        Task ValidateUpdateSubscriptionAsync(UpdateSubscriptionDto dto);
    }
}