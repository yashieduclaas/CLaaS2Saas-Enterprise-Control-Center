namespace ECC.API.Examples;

public interface IExampleRepository
{
    Task<int> CountAsync();
}

public sealed class ExampleRepository : IExampleRepository
{
    public Task<int> CountAsync() => Task.FromResult(0);
}
