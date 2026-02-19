namespace Kernel.Domain.Exceptions;

public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
    protected DomainException(string message, Exception inner) : base(message, inner) { }
}

public sealed class TenantNotFoundException : DomainException
{
    public TenantNotFoundException(string tenantId)
        : base($"Tenant '{tenantId}' was not found.") { }
}

public sealed class UnauthorizedTenantAccessException : DomainException
{
    public UnauthorizedTenantAccessException(string tenantId)
        : base($"Access denied for tenant '{tenantId}'.") { }
}
