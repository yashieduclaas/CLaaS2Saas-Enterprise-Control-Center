namespace ECC.Domain.Exceptions;

/// <summary>
/// Application-level exception with a structured error code.
/// All service-layer exceptions must use this type, never System.Exception directly.
/// </summary>
public class AppException : Exception
{
    /// <summary>Structured error code from ErrorCodes constants.</summary>
    public string ErrorCode { get; }

    public AppException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }

    public AppException(string errorCode, string message, Exception innerException) : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}
