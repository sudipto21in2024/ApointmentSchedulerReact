using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Validators
{
    public static class ValidationExtensions
    {
        public static async Task<IActionResult?> ValidateAndReturnResult<T>(this IValidator<T> validator, T model)
        {
            var validationResult = await validator.ValidateAsync(model);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new { Field = e.PropertyName, Message = e.ErrorMessage });
                return new BadRequestObjectResult(new { Errors = errors });
            }
            return null; // No validation errors
        }
    }
}