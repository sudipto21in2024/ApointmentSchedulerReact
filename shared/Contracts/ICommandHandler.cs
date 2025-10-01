using MediatR;

namespace Shared.Contracts
{
    public interface ICommandHandler<TCommand> : IRequestHandler<TCommand>
        where TCommand : ICommand, IRequest
    {
    }
}