using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Data;
using Shared.DTOs;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConfigurationService.Services
{
    /// <summary>
    /// Implementation of the ISystemAdminPricingPlanService interface for pricing plan management operations
    /// </summary>
    public class SystemAdminPricingPlanService : ISystemAdminPricingPlanService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SystemAdminPricingPlanService> _logger;

        /// <summary>
        /// Initializes a new instance of the SystemAdminPricingPlanService class
        /// </summary>
        /// <param name="context">The database context</param>
        /// <param name="logger">The logger</param>
        public SystemAdminPricingPlanService(ApplicationDbContext context, ILogger<SystemAdminPricingPlanService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets all pricing plans with pagination
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Number of items per page</param>
        /// <param name="sort">Sort field</param>
        /// <param name="order">Sort order</param>
        /// <returns>Paginated list of pricing plans</returns>
        public async Task<PricingPlanListDto> GetAllPricingPlansAsync(int page = 1, int pageSize = 10, string? sort = null, string? order = "desc")
        {
            try
            {
                var query = _context.PricingPlans.AsQueryable();

                // Apply sorting
                if (!string.IsNullOrEmpty(sort))
                {
                    query = order?.ToLower() == "asc"
                        ? query.OrderBy(p => EF.Property<object>(p, sort))
                        : query.OrderByDescending(p => EF.Property<object>(p, sort));
                }
                else
                {
                    query = query.OrderByDescending(p => p.CreatedDate);
                }

                var totalCount = await query.CountAsync();
                var pricingPlans = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var pricingPlanDtos = pricingPlans.Select(MapToDto).ToList();

                return new PricingPlanListDto
                {
                    PricingPlans = pricingPlanDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pricing plans");
                throw;
            }
        }

        /// <summary>
        /// Gets a pricing plan by ID
        /// </summary>
        /// <param name="id">Pricing plan ID</param>
        /// <returns>Pricing plan DTO</returns>
        public async Task<PricingPlanDto> GetPricingPlanByIdAsync(Guid id)
        {
            try
            {
                var pricingPlan = await _context.PricingPlans.FindAsync(id);

                if (pricingPlan == null)
                {
                    throw new KeyNotFoundException($"Pricing plan {id} not found");
                }

                return MapToDto(pricingPlan);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException))
            {
                _logger.LogError(ex, "Error retrieving pricing plan {PricingPlanId}", id);
                throw;
            }
        }

        /// <summary>
        /// Creates a new pricing plan
        /// </summary>
        /// <param name="request">Create pricing plan request</param>
        /// <returns>Created pricing plan DTO</returns>
        public async Task<PricingPlanDto> CreatePricingPlanAsync(CreatePricingPlanRequest request)
        {
            try
            {
                // Check for unique name constraint
                var existingPlan = await _context.PricingPlans
                    .AnyAsync(p => p.Name.ToLower() == request.Name.ToLower());
                if (existingPlan)
                {
                    throw new InvalidOperationException("Pricing plan name already exists");
                }

                var pricingPlan = new PricingPlan
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    Price = request.Price,
                    Currency = request.Currency,
                    Interval = request.Interval,
                    Features = request.Features ?? new List<string>(),
                    MaxUsers = request.MaxUsers,
                    MaxAppointments = request.MaxAppointments,
                    Status = PricingPlanStatus.Active,
                    CreatedDate = DateTime.UtcNow
                };

                _context.PricingPlans.Add(pricingPlan);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Pricing plan {PricingPlanId} created successfully", pricingPlan.Id);
                return MapToDto(pricingPlan);
            }
            catch (Exception ex) when (!(ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Error creating pricing plan");
                throw;
            }
        }

        /// <summary>
        /// Updates an existing pricing plan
        /// </summary>
        /// <param name="id">Pricing plan ID</param>
        /// <param name="request">Update pricing plan request</param>
        /// <returns>Updated pricing plan DTO</returns>
        public async Task<PricingPlanDto> UpdatePricingPlanAsync(Guid id, UpdatePricingPlanRequest request)
        {
            try
            {
                var pricingPlan = await _context.PricingPlans.FindAsync(id);

                if (pricingPlan == null)
                {
                    throw new KeyNotFoundException($"Pricing plan {id} not found");
                }

                // Check unique name constraint if name is being updated
                if (!string.IsNullOrEmpty(request.Name) && request.Name != pricingPlan.Name)
                {
                    var existingPlan = await _context.PricingPlans
                        .AnyAsync(p => p.Name.ToLower() == request.Name.ToLower() && p.Id != id);
                    if (existingPlan)
                    {
                        throw new InvalidOperationException("Pricing plan name already exists");
                    }
                }

                // Update properties
                if (!string.IsNullOrEmpty(request.Name))
                    pricingPlan.Name = request.Name;
                if (!string.IsNullOrEmpty(request.Description))
                    pricingPlan.Description = request.Description;
                if (request.Price.HasValue)
                    pricingPlan.Price = request.Price.Value;
                if (!string.IsNullOrEmpty(request.Currency))
                    pricingPlan.Currency = request.Currency;
                if (!string.IsNullOrEmpty(request.Interval))
                    pricingPlan.Interval = request.Interval;
                if (request.Features != null)
                    pricingPlan.Features = request.Features;
                if (request.MaxUsers.HasValue)
                    pricingPlan.MaxUsers = request.MaxUsers.Value;
                if (request.MaxAppointments.HasValue)
                    pricingPlan.MaxAppointments = request.MaxAppointments.Value;

                pricingPlan.UpdatedDate = DateTime.UtcNow;

                _context.PricingPlans.Update(pricingPlan);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Pricing plan {PricingPlanId} updated successfully", id);
                return MapToDto(pricingPlan);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException || ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Error updating pricing plan {PricingPlanId}", id);
                throw;
            }
        }

        /// <summary>
        /// Updates pricing plan status
        /// </summary>
        /// <param name="id">Pricing plan ID</param>
        /// <param name="request">Update status request</param>
        /// <returns>Updated pricing plan DTO</returns>
        public async Task<PricingPlanDto> UpdatePricingPlanStatusAsync(Guid id, UpdatePricingPlanStatusRequest request)
        {
            try
            {
                var pricingPlan = await _context.PricingPlans.FindAsync(id);

                if (pricingPlan == null)
                {
                    throw new KeyNotFoundException($"Pricing plan {id} not found");
                }

                pricingPlan.Status = request.Status;
                pricingPlan.UpdatedDate = DateTime.UtcNow;

                _context.PricingPlans.Update(pricingPlan);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Pricing plan {PricingPlanId} status updated to {Status}", id, request.Status);
                return MapToDto(pricingPlan);
            }
            catch (Exception ex) when (!(ex is KeyNotFoundException))
            {
                _logger.LogError(ex, "Error updating pricing plan status {PricingPlanId}", id);
                throw;
            }
        }

        private static PricingPlanDto MapToDto(PricingPlan pricingPlan)
        {
            return new PricingPlanDto
            {
                Id = pricingPlan.Id,
                Name = pricingPlan.Name,
                Description = pricingPlan.Description,
                Price = pricingPlan.Price,
                Currency = pricingPlan.Currency,
                Interval = pricingPlan.Interval,
                Features = pricingPlan.Features,
                MaxUsers = pricingPlan.MaxUsers,
                MaxAppointments = pricingPlan.MaxAppointments,
                Status = pricingPlan.Status,
                CreatedDate = pricingPlan.CreatedDate,
                UpdatedDate = pricingPlan.UpdatedDate
            };
        }
    }
}