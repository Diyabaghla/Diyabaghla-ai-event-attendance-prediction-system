using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Services;

namespace EventPredictionAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reports;

    public ReportsController(IReportService reports) => _reports = reports;

    /// <summary>Get attendance vs registration data for all events.</summary>
    [HttpGet("attendance-vs-registration")]
    [ProducesResponseType(typeof(List<AttendanceReportItem>), 200)]
    public async Task<IActionResult> AttendanceVsRegistration()
    {
        var result = await _reports.GetAttendanceVsRegistrationAsync();
        return Ok(result);
    }

    /// <summary>Get total cancelled vs registered count across all events.</summary>
    [HttpGet("cancelled-vs-registered")]
    [ProducesResponseType(typeof(RegistrationStatusReport), 200)]
    public async Task<IActionResult> CancelledVsRegistered()
    {
        var result = await _reports.GetCancelledVsRegisteredAsync();
        return Ok(result);
    }

    /// <summary>Get performance metrics for all events.</summary>
    [HttpGet("event-performance")]
    [ProducesResponseType(typeof(List<EventPerformanceReport>), 200)]
    public async Task<IActionResult> EventPerformance()
    {
        var result = await _reports.GetEventPerformanceAsync();
        return Ok(result);
    }
}
