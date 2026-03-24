# Security

- [Authorize] on protected endpoints
- Entra object ID from User.FindFirst("oid").Value
- No PII in logs
- Use AppException for structured service/repository errors
- Audit events required for state-changing operations
- SQL injection prevention via parameterized SQL / EF Core
