using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PaymentService.Services;
using Shared.DTOs;
using Shared.Contracts;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("payment-methods")]
    public class PaymentMethodController : ControllerBase
    {
        private readonly ILogger<PaymentMethodController> _logger;
        private readonly Shared.Contracts.IPaymentMethodService _paymentMethodService;

        public PaymentMethodController(
            ILogger<PaymentMethodController> logger,
            Shared.Contracts.IPaymentMethodService paymentMethodService)
        {
            _logger = logger;
            _paymentMethodService = paymentMethodService;
        }

        /// <summary>
        /// Get all payment methods for a user or tenant
        /// </summary>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>List of payment methods</returns>
        [HttpGet]
        public async Task<IActionResult> GetPaymentMethods([FromQuery] Guid? userId, [FromQuery] Guid? tenantId)
        {
            _logger.LogInformation("Received request to get payment methods for user {UserId} or tenant {TenantId}", userId, tenantId);

            if (!userId.HasValue && !tenantId.HasValue)
            {
                return BadRequest(new { Message = "Either userId or tenantId must be provided" });
            }

            try
            {
                var paymentMethods = await _paymentMethodService.GetPaymentMethodsAsync(userId, tenantId);
                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment methods");
                return StatusCode(500, new { Message = "An error occurred while retrieving payment methods", Error = ex.Message });
            }
        }

        /// <summary>
        /// Add a new payment method
        /// </summary>
        /// <param name="request">Payment method creation request</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>Created payment method</returns>
        [HttpPost]
        public async Task<IActionResult> AddPaymentMethod([FromBody] CreatePaymentMethodRequest request, [FromQuery] Guid? userId, [FromQuery] Guid? tenantId)
        {
            _logger.LogInformation("Received request to add payment method for user {UserId} or tenant {TenantId}", userId, tenantId);

            if (!userId.HasValue && !tenantId.HasValue)
            {
                return BadRequest(new { Message = "Either userId or tenantId must be provided" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var paymentMethod = await _paymentMethodService.AddPaymentMethodAsync(userId, tenantId, request);
                return CreatedAtAction(nameof(GetPaymentMethods), new { userId, tenantId }, paymentMethod);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding payment method");
                return StatusCode(500, new { Message = "An error occurred while adding the payment method", Error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentMethod(Guid id, [FromQuery] Guid? userId, [FromQuery] Guid? tenantId)
        {
            _logger.LogInformation("Received request to delete payment method {Id} for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            if (!userId.HasValue && !tenantId.HasValue)
            {
                return BadRequest(new { Message = "Either userId or tenantId must be provided" });
            }

            try
            {
                await _paymentMethodService.DeletePaymentMethodAsync(id, userId, tenantId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting payment method {Id}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the payment method", Error = ex.Message });
            }
        }

        /// <summary>
        /// Set a payment method as default
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>No content</returns>
        [HttpPut("{id}/default")]
        public async Task<IActionResult> SetDefaultPaymentMethod(Guid id, [FromQuery] Guid? userId, [FromQuery] Guid? tenantId)
        {
            _logger.LogInformation("Received request to set payment method {Id} as default for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            if (!userId.HasValue && !tenantId.HasValue)
            {
                return BadRequest(new { Message = "Either userId or tenantId must be provided" });
            }

            try
            {
                await _paymentMethodService.SetDefaultPaymentMethodAsync(id, userId, tenantId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting payment method {Id} as default", id);
                return StatusCode(500, new { Message = "An error occurred while setting the payment method as default", Error = ex.Message });
            }
        }

        /// <summary>
        /// Update a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="request">Update request</param>
        /// <param name="userId">User ID (optional)</param>
        /// <param name="tenantId">Tenant ID (optional)</param>
        /// <returns>No content</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePaymentMethod(Guid id, [FromBody] UpdatePaymentMethodRequest request, [FromQuery] Guid? userId, [FromQuery] Guid? tenantId)
        {
            _logger.LogInformation("Received request to update payment method {Id} for user {UserId} or tenant {TenantId}", id, userId, tenantId);

            if (!userId.HasValue && !tenantId.HasValue)
            {
                return BadRequest(new { Message = "Either userId or tenantId must be provided" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _paymentMethodService.UpdatePaymentMethodAsync(id, userId, tenantId, request);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment method {Id}", id);
                return StatusCode(500, new { Message = "An error occurred while updating the payment method", Error = ex.Message });
            }
        }
    }
}