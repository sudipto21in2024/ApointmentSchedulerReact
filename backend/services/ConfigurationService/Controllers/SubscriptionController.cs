using ConfigurationService.Services;
using ConfigurationService.Validators;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConfigurationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ISubscriptionValidator _subscriptionValidator;

        public SubscriptionsController(ISubscriptionService subscriptionService, ISubscriptionValidator subscriptionValidator)
        {
            _subscriptionService = subscriptionService;
            _subscriptionValidator = subscriptionValidator;
        }

        [HttpGet("plans")]
        public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetPricingPlans()
        {
            var plans = await _subscriptionService.GetPricingPlansAsync();
            return Ok(plans);
        }

        [HttpGet("plans/{id}")]
        public async Task<ActionResult<PricingPlanDto>> GetPricingPlanById(Guid id)
        {
            var plan = await _subscriptionService.GetPricingPlanByIdAsync(id);
            if (plan == null)
            {
                return NotFound();
            }
            return Ok(plan);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubscriptionDto>> GetSubscriptionById(Guid id)
        {
            var subscription = await _subscriptionService.GetSubscriptionByIdAsync(id);
            if (subscription == null)
            {
                return NotFound();
            }
            return Ok(subscription);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<SubscriptionDto>> GetSubscriptionByUserId(Guid userId)
        {
            var subscription = await _subscriptionService.GetSubscriptionByUserIdAsync(userId);
            if (subscription == null)
            {
                return NotFound();
            }
            return Ok(subscription);
        }

        [HttpPost("create")]
        public async Task<ActionResult<SubscriptionDto>> CreateSubscription(CreateSubscriptionDto createSubscriptionDto)
        {
            try
            {
                await _subscriptionValidator.ValidateCreateSubscriptionAsync(createSubscriptionDto);
                var subscription = await _subscriptionService.CreateSubscriptionAsync(createSubscriptionDto);
                return CreatedAtAction(nameof(GetSubscriptionById), new { id = subscription.Id }, subscription);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/change-plan")]
        public async Task<ActionResult<SubscriptionDto>> ChangeSubscriptionPlan(Guid id, UpdateSubscriptionDto updateSubscriptionDto)
        {
            try
            {
                await _subscriptionValidator.ValidateUpdateSubscriptionAsync(updateSubscriptionDto);
                var subscription = await _subscriptionService.ChangeSubscriptionPlanAsync(id, updateSubscriptionDto);
                return Ok(subscription);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}/cancel")]
        public async Task<ActionResult> CancelSubscription(Guid id)
        {
            try
            {
                await _subscriptionService.CancelSubscriptionAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/usage")]
        public async Task<ActionResult<SubscriptionUsageDto>> GetSubscriptionUsage(Guid id)
        {
            try
            {
                var usage = await _subscriptionService.GetSubscriptionUsageAsync(id);
                return Ok(usage);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}