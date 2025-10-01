using Microsoft.AspNetCore.Mvc;
using Shared.Events;
using Shared.DTOs;
using Shared.Models;
using MassTransit;
using Microsoft.Extensions.Logging;
using PaymentService.Services;
using PaymentService.Validators;
using System;
using System.Threading.Tasks;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly ILogger<PaymentController> _logger;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IPaymentService _paymentService;
        private readonly IPaymentValidator _paymentValidator;

        public PaymentController(
            ILogger<PaymentController> logger,
            IPublishEndpoint publishEndpoint,
            IPaymentService paymentService,
            IPaymentValidator paymentValidator)
        {
            _logger = logger;
            _publishEndpoint = publishEndpoint;
            _paymentService = paymentService;
            _paymentValidator = paymentValidator;
        }

        /// <summary>
        /// Process a payment for a booking
        /// </summary>
        /// <param name="request">Payment processing request</param>
        /// <returns>Payment result</returns>
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            _logger.LogInformation("Received request to process payment for booking {BookingId}", request.BookingId);

            // Validate the request
            var validationResult = await _paymentValidator.ValidateProcessPaymentRequestAsync(request, request.TenantId);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Errors = validationResult.Errors });
            }

            try
            {
                var paymentDetails = await _paymentService.ProcessPaymentAsync(request);
                return Ok(paymentDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for booking {BookingId}", request.BookingId);
                return StatusCode(500, new { Message = "An error occurred while processing the payment", Error = ex.Message });
            }
        }

        /// <summary>
        /// Process a refund for a payment
        /// </summary>
        /// <param name="request">Refund request</param>
        /// <returns>Refund result</returns>
        [HttpPost("refund")]
        public async Task<IActionResult> ProcessRefund([FromBody] RefundPaymentRequest request)
        {
            _logger.LogInformation("Received request to process refund for payment {PaymentId}", request.PaymentId);

            // Validate the request
            var validationResult = await _paymentValidator.ValidateRefundPaymentRequestAsync(request, request.TenantId);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Errors = validationResult.Errors });
            }

            try
            {
                var paymentDetails = await _paymentService.ProcessRefundAsync(request);
                return Ok(paymentDetails);
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
                _logger.LogError(ex, "Error processing refund for payment {PaymentId}", request.PaymentId);
                return StatusCode(500, new { Message = "An error occurred while processing the refund", Error = ex.Message });
            }
        }

        /// <summary>
        /// Get payment details by ID
        /// </summary>
        /// <param name="id">Payment ID</param>
        /// <param name="tenantId">Tenant ID</param>
        /// <returns>Payment details</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentDetails(Guid id, [FromQuery] Guid tenantId)
        {
            _logger.LogInformation("Received request to get payment details for payment {PaymentId}", id);

            if (id == Guid.Empty)
            {
                return BadRequest(new { Message = "Payment ID is required" });
            }

            if (tenantId == Guid.Empty)
            {
                return BadRequest(new { Message = "Tenant ID is required" });
            }

            try
            {
                var paymentDetails = await _paymentService.GetPaymentDetailsAsync(id, tenantId);
                return Ok(paymentDetails);
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
                _logger.LogError(ex, "Error retrieving payment details for payment {PaymentId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving payment details", Error = ex.Message });
            }
        }

        /// <summary>
        /// Create a subscription
        /// </summary>
        /// <param name="request">Subscription creation request</param>
        /// <returns>Subscription details</returns>
        [HttpPost("subscriptions/create")]
        public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionRequest request)
        {
            _logger.LogInformation("Received request to create subscription for customer {CustomerId}", request.CustomerId);

            // Validate the request
            var validationResult = await _paymentValidator.ValidateCreateSubscriptionRequestAsync(request, request.TenantId);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Errors = validationResult.Errors });
            }

            try
            {
                var paymentDetails = await _paymentService.CreateSubscriptionAsync(request);
                return Ok(paymentDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription for customer {CustomerId}", request.CustomerId);
                return StatusCode(500, new { Message = "An error occurred while creating the subscription", Error = ex.Message });
            }
        }
    }
}