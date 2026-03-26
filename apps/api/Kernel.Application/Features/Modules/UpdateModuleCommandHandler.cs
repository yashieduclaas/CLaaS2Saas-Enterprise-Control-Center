namespace Kernel.Application.Features.Modules;

using MediatR;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-update-module-handler
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Handles <see cref="UpdateModuleCommand"/> requests.
/// </summary>
/// <remarks>
/// This handler is intentionally lightweight in the current in-memory MVP.
/// API controller logic performs the concrete mutation until persistence/repository
/// infrastructure is wired into the application layer.
/// </remarks>
public sealed class UpdateModuleCommandHandler : IRequestHandler<UpdateModuleCommand, UpdateModuleResult>
{
    /// <summary>
    /// Handles the update module request.
    /// </summary>
    /// <param name="request">The incoming update command.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>An <see cref="UpdateModuleResult"/> indicating acceptance.</returns>
    public Task<UpdateModuleResult> Handle(UpdateModuleCommand request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return Task.FromResult(new UpdateModuleResult
        {
            Updated = true,
        });
    }
}
