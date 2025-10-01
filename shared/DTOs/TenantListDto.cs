using System.Collections.Generic;

namespace Shared.DTOs
{
    public class TenantListDto
    {
        public IEnumerable<TenantDto> Tenants { get; set; } = new List<TenantDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}