using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Kernel.API.Tests.TestFixtures;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-api-tests-factory
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// WebApplicationFactory for Kernel.API integration tests.
/// Boots the full API with real DI container and middleware pipeline.
/// No real database required (in-memory setup is used).
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private const string DemoUserHeader = "X-Demo-User";
    private const string TenantHeader = "X-Tenant-Id";

    /// <summary>
    /// Configures the test host to use test environment settings.
    /// </summary>
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        base.ConfigureWebHost(builder);
    }

    /// <summary>
    /// Creates an HttpClient configured for integration tests.
    /// Includes support for cookie-based session tracking.
    /// </summary>
    public HttpClient CreateTestClient()
    {
        var client = CreateClient();
        client.Timeout = TimeSpan.FromSeconds(10);
        return client;
    }

    /// <summary>
    /// Creates a client authenticated through demo auth with the provided demo user.
    /// </summary>
    public HttpClient CreateAuthorizedClient(string demoUser = "global.admin@demo.com")
    {
        var client = CreateTestClient();
        client.DefaultRequestHeaders.Remove(DemoUserHeader);
        client.DefaultRequestHeaders.Remove(TenantHeader);
        client.DefaultRequestHeaders.Add(DemoUserHeader, demoUser);
        client.DefaultRequestHeaders.Add(TenantHeader, "tenant-global");
        return client;
    }

    /// <summary>
    /// Creates a client without demo-auth headers so requests are anonymous.
    /// </summary>
    public HttpClient CreateAnonymousClient()
    {
        var client = CreateTestClient();
        client.DefaultRequestHeaders.Remove(DemoUserHeader);
        client.DefaultRequestHeaders.Remove(TenantHeader);
        client.DefaultRequestHeaders.Add(TenantHeader, "tenant-global");
        return client;
    }
}
