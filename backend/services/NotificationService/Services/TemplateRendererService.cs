using System.IO;
using System.Threading.Tasks;
using RazorLight; // Using RazorLight for template rendering
using RazorLight.Razor;

namespace NotificationService.Services
{
    public class TemplateRendererService : ITemplateRendererService
    {
        private readonly IRazorLightEngine _razorEngine;

        public TemplateRendererService(IRazorLightEngine razorEngine)
        {
            _razorEngine = razorEngine;
        }

        public async Task<string> RenderTemplateAsync<T>(string templateName, T model)
        {
            // RazorLight expects templateName without file extension
            var templateKey = Path.GetFileNameWithoutExtension(templateName);
            return await _razorEngine.CompileRenderAsync(templateKey, model);
        }
    }
}