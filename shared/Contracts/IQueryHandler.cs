using MediatR;

namespace Shared.Contracts
{
    public interface IQueryHandler<TQuery, TResult> : IRequestHandler<TQuery, TResult>
        where TQuery : IQuery<TResult>, IRequest<TResult>
    {
    }
}