// using Microsoft.AspNetCore.Mvc;
// using EventPredictionAPI.DTOs;
// using EventPredictionAPI.Services;

// namespace EventPredictionAPI.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class AuthController : ControllerBase
// {
//     private readonly IAuthService _auth;

//     public AuthController(IAuthService auth) => _auth = auth;

//     /// <summary>Register a new user account.</summary>
//     [HttpPost("signup")]
//     [ProducesResponseType(typeof(AuthResponse), 201)]
//     [ProducesResponseType(400)]
//     [ProducesResponseType(409)]
//     public async Task<IActionResult> Signup([FromBody] SignupRequest request)
//     {
//         try
//         {
//             var result = await _auth.SignupAsync(request);
//             return StatusCode(201, result);
//         }
//         catch (InvalidOperationException ex)
//         {
//             return Conflict(new { message = ex.Message });
//         }
//     }

//     /// <summary>Authenticate and receive a JWT token.</summary>
//     [HttpPost("login")]
//     [ProducesResponseType(typeof(AuthResponse), 200)]
//     [ProducesResponseType(401)]
//     public async Task<IActionResult> Login([FromBody] LoginRequest request)
//     {
//         try
//         {
//             var result = await _auth.LoginAsync(request);
//             return Ok(result);
//         }
//         catch (UnauthorizedAccessException ex)
//         {
//             return Unauthorized(new { message = ex.Message });
//         }
//     }
// }
using Microsoft.AspNetCore.Mvc;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Services;

namespace EventPredictionAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService  _auth;
    private readonly IEmailService _email;
    private readonly ILogger<AuthController> _log;

    public AuthController(
        IAuthService  auth,
        IEmailService email,
        ILogger<AuthController> log)
    {
        _auth  = auth;
        _email = email;
        _log   = log;
    }

    /// <summary>Register a new user account.</summary>
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        try
        {
            var result = await _auth.SignupAsync(request);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Authenticate and receive a JWT token.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _auth.LoginAsync(request);

            // ✅ Extract values BEFORE async task
            var email     = result.Email;
            var fullName  = result.FullName;
            var loginTime = DateTime.Now.ToString("dddd, MMMM dd, yyyy · h:mm tt");
            var ip        = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

            // ✅ Safe background email (no HttpContext inside)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _email.SendLoginSuccessAsync(
                        email,
                        fullName,
                        loginTime,
                        ip
                    );
                }
                catch (Exception ex)
                {
                    _log.LogError(ex, "Login email failed for {Email}", email);
                }
            });

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}