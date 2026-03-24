namespace ECC.API.Examples;

public interface IExampleService
{
    Task<string> GetStatusAsync();
}

public sealed class ExampleService : IExampleService
{
    public Task<string> GetStatusAsync() => Task.FromResult("ok");
}
