namespace Shared.Contracts
{
    public interface IEventStore
    {
        Task Append(IEvent @event);
        Task<IEnumerable<IEvent>> GetEvents(string entityId);
    }
}