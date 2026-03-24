namespace ECC.API.Examples;

public sealed record ExampleResponseDto(string Message);

public sealed class ExampleRequestDto
{
    public string Name { get; set; } = string.Empty;
}
