using System;

namespace Shared.DTOs
{
    /// <summary>
    /// Request model for updating a service category
    /// </summary>
    public class UpdateCategoryRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string? IconUrl { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
    }
}