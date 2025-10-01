using System.Threading.Tasks;

namespace NotificationService.Services
{
    public interface ITemplateRendererService
    {
        Task<string> RenderTemplateAsync<T>(string templateName, T model);
    }
}