using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Shared.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConfigurationService.Services;

namespace ConfigurationService.Controllers
{
    [ApiController]
    [Route("system-admin/pricing-plans")]
    [Authorize(Roles = "SuperAdmin")]
    public class SystemAdminPricingPlanController : ControllerBase
    {
        private readonly ISystemAdminPricingPlanService _pricingPlanService;
        private readonly ILogger<SystemAdminPricingPlanController> _logger;

        public SystemAdminPricingPlanController(
            ISystemAdminPricingPlanService pricingPlanService,
            ILogger<SystemAdminPricingPlanController> logger)
        {
            _pricingPlanService = pricingPlanService;
            _logger = logger;
        }

        /// <summary>
        /// Get all pricing plans
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PricingPlanListDto), 200)]
        public async Task<IActionResult> GetAllPricingPlans(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sort = null,
            [FromQuery] string? order = "desc")
        {
            try
            {
                var result = await _pricingPlanService.GetAllPricingPlansAsync(page, pageSize, sort, order);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pricing plans");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get pricing plan by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PricingPlanDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPricingPlanById(Guid id)
        {
            try
            {
                var pricingPlan = await _pricingPlanService.GetPricingPlanByIdAsync(id);
                return Ok(pricingPlan);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Pricing plan not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pricing plan {PricingPlanId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new pricing plan
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(PricingPlanDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreatePricingPlan([FromBody] CreatePricingPlanRequest request)
        {
            try
            {
                var pricingPlan = await _pricingPlanService.CreatePricingPlanAsync(request);
                return CreatedAtAction(nameof(GetPricingPlanById), new { id = pricingPlan.Id }, pricingPlan);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pricing plan");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update pricing plan details
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(PricingPlanDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdatePricingPlan(Guid id, [FromBody] UpdatePricingPlanRequest request)
        {
            try
            {
                var pricingPlan = await _pricingPlanService.UpdatePricingPlanAsync(id, request);
                return Ok(pricingPlan);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Pricing plan not found");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pricing plan {PricingPlanId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update pricing plan status
        /// </summary>
        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(PricingPlanDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdatePricingPlanStatus(Guid id, [FromBody] UpdatePricingPlanStatusRequest request)
        {
            try
            {
                var pricingPlan = await _pricingPlanService.UpdatePricingPlanStatusAsync(id, request);
                return Ok(pricingPlan);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Pricing plan not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pricing plan status {PricingPlanId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}