using Xunit;
using System.Threading.Tasks;
using NotificationService.Services;
using Shared.DTOs.EmailTemplates;
using Moq;
using RazorLight;
using System;
using System.IO;

namespace NotificationService.Tests
{
    public class TemplateRendererServiceTests : IDisposable
    {
        private readonly TemplateRendererService _templateRendererService;
        private readonly Mock<IRazorLightEngine> _mockRazorLightEngine;

        public TemplateRendererServiceTests()
        {
            _mockRazorLightEngine = new Mock<IRazorLightEngine>();
            _templateRendererService = new TemplateRendererService(_mockRazorLightEngine.Object);
        }

        [Fact]
        public async Task RenderTemplateAsync_WithValidModel_ReturnsRenderedContent()
        {
            // Arrange
            var model = new { Name = "World", Value = "RazorLight" };
            var templateName = "TestTemplate"; // Removed .html extension

            _mockRazorLightEngine.Setup(x => x.CompileRenderAsync(templateName, It.IsAny<object>(), null))
                .ReturnsAsync("<h1>Hello, World!</h1><p>This is a test for RazorLight.</p>");

            // Act
            var result = await _templateRendererService.RenderTemplateAsync(templateName, model);

            // Assert
            Assert.Contains("<h1>Hello, World!</h1>", result);
            Assert.Contains("<p>This is a test for RazorLight.</p>", result);
        }

        [Fact]
        public async Task RenderTemplateAsync_WithBookingConfirmationDto_ReturnsRenderedContent()
        {
            // Arrange
            var model = new BookingConfirmationEmailDto
            {
                CustomerName = "John Doe",
                ServiceName = "Haircut",
                BookingDate = new DateTime(2025, 10, 26),
                BookingTime = "10:00 AM",
                ProviderName = "Jane Smith"
            };
            var templateName = "BookingConfirmation"; // Removed .html extension

            _mockRazorLightEngine.Setup(x => x.CompileRenderAsync(templateName, It.IsAny<BookingConfirmationEmailDto>(), null))
                .ReturnsAsync("Dear John Doe, your booking for Haircut on 10/26/2025 at 10:00 AM with Jane Smith is confirmed.");

            // Act
            var result = await _templateRendererService.RenderTemplateAsync(templateName, model);

            // Assert
            Assert.Contains("Dear John Doe, your booking for Haircut on 10/26/2025 at 10:00 AM with Jane Smith is confirmed.", result);
        }
        
        public void Dispose()
        {
            // No cleanup needed as we are mocking the engine now
        }
    }
}