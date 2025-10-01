using FluentValidation;
using UserService.DTO;

namespace UserService.Validators
{
    public class RegisterProviderRequestValidator : AbstractValidator<RegisterProviderRequest>
    {
        public RegisterProviderRequestValidator()
        {
            // User Information Validation
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                .Matches(@"[A-Z]+").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]+").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]+").WithMessage("Password must contain at least one digit.");

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            // Tenant Information Validation
            RuleFor(x => x.TenantId)
                .NotEmpty().WithMessage("Tenant ID is required.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.ContactEmail)
                .EmailAddress().WithMessage("Invalid contact email format.")
                .When(x => !string.IsNullOrEmpty(x.ContactEmail));

            RuleFor(x => x.LogoUrl)
                .MaximumLength(500).WithMessage("Logo URL must not exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.LogoUrl));

            // Subscription Information Validation
            RuleFor(x => x.PricingPlanId)
                .NotEmpty().WithMessage("Pricing plan ID is required.");

            // Payment Information Validation (only required for paid plans)
            RuleFor(x => x.PaymentMethod)
                .NotEmpty().WithMessage("Payment method is required for paid plans.")
                .When(x => x.IsPaidPlanRegistration());

            RuleFor(x => x.CardToken)
                .NotEmpty().WithMessage("Card token is required for paid plans.")
                .When(x => x.IsPaidPlanRegistration());
        }
    }
}