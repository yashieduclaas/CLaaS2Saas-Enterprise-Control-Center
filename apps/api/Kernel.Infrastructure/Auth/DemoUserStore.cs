using System.Security.Claims;

namespace Kernel.Infrastructure.Auth;

/// <summary>
/// Static seed of demo users for AUTH_MODE=Demo.
/// Each entry exposes claims matching Entra JWT shape for TenantMiddleware compatibility.
/// </summary>
public static class DemoUserStore
{
    public static readonly IReadOnlyList<DemoUser> Users =
    [
        new DemoUser(
            Email: "global.admin@demo.com",
            TenantId: "tenant-global",
            DisplayName: "Global Admin",
            Role: "GLOBAL_ADMIN",
            Sub: "demo-user-global-admin"),
        new DemoUser(
            Email: "security.admin@demo.com",
            TenantId: "tenant-a",
            DisplayName: "Security Admin",
            Role: "SECURITY_ADMIN",
            Sub: "demo-user-security-admin"),
        new DemoUser(
            Email: "helpdesk@demo.com",
            TenantId: "tenant-a",
            DisplayName: "Help Desk",
            Role: "HELPDESK",
            Sub: "demo-user-helpdesk"),
        new DemoUser(
            Email: "user@tenantA.com",
            TenantId: "tenant-a",
            DisplayName: "User TenantA",
            Role: "STANDARD_USER",
            Sub: "demo-user-tenant-a"),
        new DemoUser(
            Email: "user@tenantB.com",
            TenantId: "tenant-b",
            DisplayName: "User TenantB",
            Role: "STANDARD_USER",
            Sub: "demo-user-tenant-b"),
    ];

    public static DemoUser? GetByEmail(string email)
    {
        return Users.FirstOrDefault(u =>
            string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));
    }

    public static DemoUser? GetBySub(string sub)
    {
        return Users.FirstOrDefault(u =>
            string.Equals(u.Sub, sub, StringComparison.Ordinal));
    }

    public static ClaimsPrincipal CreatePrincipal(DemoUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Sub),
            new("sub", user.Sub),
            new("oid", user.Sub),
            new("tid", user.TenantId),
            new(ClaimTypes.Name, user.DisplayName),
            new("name", user.DisplayName),
            new("preferred_username", user.Email),
            new(ClaimTypes.Role, user.Role),
        };

        var identity = new ClaimsIdentity(claims, "Demo");
        return new ClaimsPrincipal(identity);
    }
}

public sealed record DemoUser(
    string Email,
    string TenantId,
    string DisplayName,
    string Role,
    string Sub);
