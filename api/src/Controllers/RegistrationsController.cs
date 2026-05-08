// using System.Security.Claims;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using EventPredictionAPI.DTOs;
// using EventPredictionAPI.Services;

// namespace EventPredictionAPI.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// [Authorize]
// public class RegistrationsController : ControllerBase
// {
//     private readonly IRegistrationService _registrations;

//     public RegistrationsController(IRegistrationService registrations)
//         => _registrations = registrations;

//     private int CurrentUserId =>
//         int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
//             ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
//             ?? throw new UnauthorizedAccessException("User ID not found in token."));

//     /// <summary>Register the current user for an event.</summary>
//     [HttpPost]
//     [ProducesResponseType(typeof(RegistrationResponse), 201)]
//     [ProducesResponseType(400)]
//     [ProducesResponseType(409)]
//     public async Task<IActionResult> Register([FromBody] RegisterRequest request)
//     {
//         try
//         {
//             var result = await _registrations.RegisterAsync(CurrentUserId, request);
//             return StatusCode(201, result);
//         }
//         catch (KeyNotFoundException ex)
//         {
//             return NotFound(new { message = ex.Message });
//         }
//         catch (InvalidOperationException ex)
//         {
//             return Conflict(new { message = ex.Message });
//         }
//     }

//     /// <summary>Cancel a registration by its ID.</summary>
//     [HttpPatch("{id:int}/cancel")]
//     [ProducesResponseType(typeof(RegistrationResponse), 200)]
//     [ProducesResponseType(404)]
//     public async Task<IActionResult> Cancel(int id)
//     {
//         try
//         {
//             var result = await _registrations.CancelAsync(CurrentUserId, id);
//             return Ok(result);
//         }
//         catch (KeyNotFoundException ex)
//         {
//             return NotFound(new { message = ex.Message });
//         }
//         catch (InvalidOperationException ex)
//         {
//             return BadRequest(new { message = ex.Message });
//         }
//     }

//     /// <summary>Get all registrations for the current user.</summary>
//     [HttpGet("my")]
//     [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
//     public async Task<IActionResult> GetMine()
//     {
//         var result = await _registrations.GetByUserAsync(CurrentUserId);
//         return Ok(result);
//     }

//     /// <summary>Get all registrations for a specific event. (Admin only)</summary>
//     [HttpGet("event/{eventId:int}")]
//     [Authorize(Roles = "Admin")]
//     [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
//     public async Task<IActionResult> GetByEvent(int eventId)
//     {
//         var result = await _registrations.GetByEventAsync(eventId);
//         return Ok(result);
//     }

//     /// <summary>Get all registrations. (Admin only)</summary>
//     [HttpGet]
//     [Authorize(Roles = "Admin")]
//     [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
//     public async Task<IActionResult> GetAll()
//     {
//         var result = await _registrations.GetAllAsync();
//         return Ok(result);
//     }
// }
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace EventPredictionAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationService   _registrations;
    private readonly IEmailService          _email;
    private readonly AppDbContext           _db;
    private readonly ILogger<RegistrationsController> _log;

    public RegistrationsController(
        IRegistrationService              registrations,
        IEmailService                     email,
        AppDbContext                      db,
        ILogger<RegistrationsController>  log)
    {
        _registrations = registrations;
        _email         = email;
        _db            = db;
        _log           = log;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? throw new UnauthorizedAccessException("User ID not found in token."));

    private string CurrentUserEmail =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)
        ?? "";

    private string CurrentUserName =>
        User.FindFirstValue("fullName")
        ?? User.FindFirstValue(ClaimTypes.Name)
        ?? "User";

    /// <summary>Register the current user for an event.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(RegistrationResponse), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _registrations.RegisterAsync(CurrentUserId, request);

          // ✅ Correct — read claims BEFORE Task.Run
var userEmail = CurrentUserEmail;   // read here while HttpContext is alive
var userName  = CurrentUserName;    // read here while HttpContext is alive
var eventId   = request.EventId;    // capture for closure

_ = Task.Run(async () =>
{
    try
    {
        if (string.IsNullOrEmpty(userEmail)) return;

        var ev = await _db.Events.FindAsync(eventId);
        if (ev == null) return;

        await _email.SendRegistrationConfirmAsync(
            userEmail,
            userName,
            ev,
            DateTime.Now);
    }
    catch (Exception ex)
    {
        _log.LogError(ex, "Registration email failed for EventId {EventId}", eventId);
    }
});
            return StatusCode(201, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Cancel a registration by its ID.</summary>
    [HttpPatch("{id:int}/cancel")]
    [ProducesResponseType(typeof(RegistrationResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var result = await _registrations.CancelAsync(CurrentUserId, id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get all registrations for the current user.</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
    public async Task<IActionResult> GetMine()
    {
        var result = await _registrations.GetByUserAsync(CurrentUserId);
        return Ok(result);
    }

    /// <summary>Get all registrations for a specific event. (Admin only)</summary>
    [HttpGet("event/{eventId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var result = await _registrations.GetByEventAsync(eventId);
        return Ok(result);
    }

    /// <summary>Get all registrations. (Admin only)</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<RegistrationResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _registrations.GetAllAsync();
        return Ok(result);
    }
}