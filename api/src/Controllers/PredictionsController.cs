using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Services;

namespace EventPredictionAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionService _prediction;

    public PredictionsController(IPredictionService prediction) => _prediction = prediction;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? throw new UnauthorizedAccessException());

    /// <summary>
    /// Predict total attendance for an event.
    /// Calls FastAPI /predict-attendance using event data from the database.
    /// </summary>
    [HttpGet("attendance/{eventId:int}")]
    [ProducesResponseType(typeof(AttendancePredictionResponse), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(502)]
    public async Task<IActionResult> PredictAttendance(int eventId)
    {
        try
        {
            var result = await _prediction.PredictAttendanceAsync(eventId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(502, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Predict whether the current user will show up for an event.
    /// Calls FastAPI /predict-no-show using the user's registration data.
    /// </summary>
    [HttpGet("no-show/{eventId:int}")]
    [ProducesResponseType(typeof(NoShowPredictionResponse), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(502)]
    public async Task<IActionResult> PredictNoShow(int eventId)
    {
        try
        {
            var result = await _prediction.PredictNoShowAsync(eventId, CurrentUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(502, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get the probability score that the current user will attend an event.
    /// Calls FastAPI /predict-user-attendance.
    /// </summary>
    [HttpGet("user-attendance/{eventId:int}")]
    [ProducesResponseType(typeof(UserAttendancePredictionResponse), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(502)]
    public async Task<IActionResult> PredictUserAttendance(int eventId)
    {
        try
        {
            var result = await _prediction.PredictUserAttendanceAsync(eventId, CurrentUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(502, new { message = ex.Message });
        }
    }
}
