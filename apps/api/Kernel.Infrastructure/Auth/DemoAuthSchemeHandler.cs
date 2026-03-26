using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace Kernel.Infrastructure.Auth;

/// <summary>
/// Authentication handler for AUTH_MODE=Demo.
/// Invoked when DefaultAuthenticateScheme="Demo".
/// Reads X-Demo-User header and returns ClaimsPrincipal from DemoUserStore.
/// </summary>
public sealed class DemoAuthSchemeHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public DemoAuthSchemeHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var email = Request.Headers["X-Demo-User"].FirstOrDefault()
            ?? "global.admin@demo.com";

        var user = DemoUserStore.GetByEmail(email);
        if (user is null)
            user = DemoUserStore.GetByEmail("global.admin@demo.com")!;

        var principal = DemoUserStore.CreatePrincipal(user!);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
