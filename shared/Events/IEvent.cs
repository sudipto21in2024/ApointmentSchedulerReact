using MediatR;

namespace Shared.Events
{
    /// <summary>
    /// Base interface for all events in the system
    /// </summary>
    public interface IEvent : INotification
    {
    }
}