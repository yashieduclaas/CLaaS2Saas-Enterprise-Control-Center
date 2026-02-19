namespace Kernel.Domain.ValueObjects;

/// <summary>
/// Strongly typed tenant identifier. Immutable value object.
/// </summary>
public sealed record TenantId(Guid Value)
{
    public static TenantId New() => new(Guid.NewGuid());

    public static TenantId Parse(string raw)
    {
        if (!Guid.TryParse(raw, out var guid))
            throw new ArgumentException($"Invalid TenantId format: '{raw}'", nameof(raw));
        return new TenantId(guid);
    }

    public override string ToString() => Value.ToString();
}
