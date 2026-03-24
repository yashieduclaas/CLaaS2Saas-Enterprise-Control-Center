using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECC.API.Examples;

[ApiController]
[Route("api/examples")]
public sealed class ExampleController : ControllerBase
{
    [HttpGet("status")]
    [Authorize]
    public ActionResult<object> GetStatus()
    {
        var oid = User.FindFirst("oid")!.Value;
        return Ok(new { success = true, data = new { oid }, error = (object?)null });
    }
}
