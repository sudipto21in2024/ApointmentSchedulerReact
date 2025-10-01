using System;
using System.Threading.Tasks;
using Shared.DTOs;

namespace Shared.Validators
{
    /// <summary>
    /// Validator for analytics and dashboard filter requests
    /// </summary>
    public class AnalyticsValidator
    {
        /// <summary>
        /// Validates analytics filter parameters
        /// </summary>
        /// <param name="filter">Analytics filter DTO</param>
        /// <returns>Validation result</returns>
        public static ValidationResult ValidateAnalyticsFilter(AnalyticsFilterDto filter)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate date range
            if (filter.StartDate.HasValue && filter.EndDate.HasValue)
            {
                if (filter.StartDate.Value > filter.EndDate.Value)
                {
                    result.IsValid = false;
                    result.Errors.Add("Start date must be before end date");
                }
                
                // Check if date range is too large (more than 1 year)
                if ((filter.EndDate.Value - filter.StartDate.Value).TotalDays > 365)
                {
                    result.IsValid = false;
                    result.Errors.Add("Date range cannot exceed 1 year");
                }
            }

            // Validate time period
            if (!string.IsNullOrEmpty(filter.TimePeriod))
            {
                var validPeriods = new[] { "day", "week", "month" };
                if (Array.IndexOf(validPeriods, filter.TimePeriod.ToLower()) == -1)
                {
                    result.IsValid = false;
                    result.Errors.Add("Time period must be 'day', 'week', or 'month'");
                }
            }

            return result;
        }

        /// <summary>
        /// Validates dashboard filter parameters
        /// </summary>
        /// <param name="filter">Dashboard filter DTO</param>
        /// <returns>Validation result</returns>
        public static ValidationResult ValidateDashboardFilter(DashboardFilterDto filter)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate date range
            if (filter.StartDate.HasValue && filter.EndDate.HasValue)
            {
                if (filter.StartDate.Value > filter.EndDate.Value)
                {
                    result.IsValid = false;
                    result.Errors.Add("Start date must be before end date");
                }
            }

            // Validate limit
            if (filter.Limit <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("Limit must be greater than 0");
            }

            // Validate limit is not too large
            if (filter.Limit > 100)
            {
                result.IsValid = false;
                result.Errors.Add("Limit cannot exceed 100");
            }

            return result;
        }
    }
}