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

    [HttpGet("attendance-vs-registration")]
    public async Task<IActionResult> AttendanceVsRegistration()
        => Ok(await _reports.GetAttendanceVsRegistrationAsync());

    [HttpGet("cancelled-vs-registered")]
    public async Task<IActionResult> CancelledVsRegistered()
        => Ok(await _reports.GetCancelledVsRegisteredAsync());

    [HttpGet("event-performance")]
    public async Task<IActionResult> EventPerformance()
        => Ok(await _reports.GetEventPerformanceAsync());

    [HttpGet("top-stats")]
    public async Task<IActionResult> TopStats()
        => Ok(await _reports.GetTopStatsAsync());

    [HttpGet("department-breakdown")]
    public async Task<IActionResult> DepartmentBreakdown()
        => Ok(await _reports.GetDepartmentBreakdownAsync());

    [HttpGet("weekly-trend")]
    public async Task<IActionResult> WeeklyTrend()
        => Ok(await _reports.GetWeeklyTrendAsync());

    // ── CSV Downloads ──────────────────────────────────────────
    [HttpGet("download/event-performance-csv")]
    public async Task<IActionResult> DownloadEventPerformanceCsv()
    {
        var data = await _reports.GetEventPerformanceAsync();
        var csv  = new System.Text.StringBuilder();
        csv.AppendLine("Event,Department,Mode,Active Registrations,Fill Rate %,Speaker Rating,Ticket Price,Past Attendance Rate");
        foreach (var r in data)
            csv.AppendLine($"\"{r.EventTitle}\",{r.Department},{r.Mode},{r.ActiveRegistrations},{r.FillRate},{r.SpeakerRating},{r.TicketPrice},{r.PastAttendanceRate}");
        return File(System.Text.Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"event-performance-{DateTime.Today:yyyy-MM-dd}.csv");
    }

    [HttpGet("download/registrations-csv")]
    public async Task<IActionResult> DownloadRegistrationsCsv()
    {
        var data = await _reports.GetAttendanceVsRegistrationAsync();
        var csv  = new System.Text.StringBuilder();
        csv.AppendLine("Event,Type,Date,Total Registrations,Active,Cancelled,Cancellation Rate %,Predicted Attendance");
        foreach (var r in data)
            csv.AppendLine($"\"{r.EventTitle}\",{r.EventType},{r.EventDate:yyyy-MM-dd},{r.TotalRegistrations},{r.ActiveRegistrations},{r.CancelledRegistrations},{r.CancellationRate},{r.PredictedAttendance}");
        return File(System.Text.Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"registrations-{DateTime.Today:yyyy-MM-dd}.csv");
    }

    [HttpGet("download/department-csv")]
    public async Task<IActionResult> DownloadDepartmentCsv()
    {
        var data = await _reports.GetDepartmentBreakdownAsync();
        var csv  = new System.Text.StringBuilder();
        csv.AppendLine("Department,Total Events,Total Registrations,Active Registrations,Avg Speaker Rating");
        foreach (var r in data.ByDepartment)
            csv.AppendLine($"{r.Department},{r.TotalEvents},{r.TotalRegistrations},{r.ActiveRegistrations},{r.AvgSpeakerRating}");
        return File(System.Text.Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"department-report-{DateTime.Today:yyyy-MM-dd}.csv");
    }
}

