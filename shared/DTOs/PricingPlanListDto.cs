using System.Collections.Generic;

namespace Shared.DTOs
{
    public class PricingPlanListDto
    {
        public IEnumerable<PricingPlanDto> PricingPlans { get; set; } = new List<PricingPlanDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}