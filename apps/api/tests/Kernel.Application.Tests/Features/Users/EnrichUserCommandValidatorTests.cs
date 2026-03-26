using FluentAssertions;
using FluentValidation;
using Kernel.Application.Features.Users;
using Xunit;

namespace Kernel.Application.Tests.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-tests-users-enrich-validator
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Unit tests for <see cref="EnrichUserCommandValidator"/>.
/// </summary>
public sealed class EnrichUserCommandValidatorTests
{
    private readonly EnrichUserCommandValidator _validator = new();

    [Fact]
    public async Task ShouldPass_WhenInputIsValid()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "John Doe",
            org_role: "Engineer",
            manager_email_id: "manager@example.com",
            manager_name: "Jane Manager",
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task ShouldFail_WhenEmailIsEmpty()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "",
            display_name: "John Doe",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "entra_email_id");
    }

    [Fact]
    public async Task ShouldFail_WhenEmailIsInvalid()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "not-an-email",
            display_name: "John Doe",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "entra_email_id");
    }

    [Fact]
    public async Task ShouldFail_WhenEmailExceedsMaxLength()
    {
        // Arrange
        var longEmail = $"{new string('a', 250)}@example.com";
        var command = new EnrichUserCommand(
            entra_email_id: longEmail,
            display_name: "John Doe",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "entra_email_id");
    }

    [Fact]
    public async Task ShouldFail_WhenDisplayNameIsEmpty()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "display_name");
    }

    [Fact]
    public async Task ShouldFail_WhenDisplayNameExceedsMaxLength()
    {
        // Arrange
        var longName = new string('x', 201);
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: longName,
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "display_name");
    }

    [Fact]
    public async Task ShouldFail_WhenOrgRoleExceedsMaxLength()
    {
        // Arrange
        var longRole = new string('x', 151);
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "John Doe",
            org_role: longRole,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "org_role");
    }

    [Fact]
    public async Task ShouldFail_WhenManagerEmailIsInvalid()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "John Doe",
            org_role: null,
            manager_email_id: "not-an-email",
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "manager_email_id");
    }

    [Fact]
    public async Task ShouldPass_WhenManagerEmailIsEmpty()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "John Doe",
            org_role: null,
            manager_email_id: "",
            manager_name: null,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue(because: "empty optional fields are allowed");
    }

    [Fact]
    public async Task ShouldFail_WhenManagerNameExceedsMaxLength()
    {
        // Arrange
        var longName = new string('x', 201);
        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "John Doe",
            org_role: null,
            manager_email_id: null,
            manager_name: longName,
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == "manager_name");
    }

    [Fact]
    public async Task ShouldPass_WithMinimalValidInput()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: "a@b.c",
            display_name: "A",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: false);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task ShouldPass_WithAllMaxLengthValues()
    {
        // Arrange
        var command = new EnrichUserCommand(
            entra_email_id: $"{new string('a', 240)}@example.com",
            display_name: new string('x', 200),
            org_role: new string('y', 150),
            manager_email_id: $"{new string('b', 240)}@example.com",
            manager_name: new string('z', 200),
            is_active: true);

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}
