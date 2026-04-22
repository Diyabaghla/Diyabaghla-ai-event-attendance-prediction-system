using Microsoft.EntityFrameworkCore;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;

namespace EventPredictionAPI.Services;

public interface IReportService
{
    Task<List<AttendanceReportItem>> GetAttendanceVsRegistrationAsync();
    Task<RegistrationStatusReport> GetCancelledVsRegisteredAsync();
    Task<List<EventPerformanceReport>> GetEventPerformanceAsync();
}

public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    private readonly IPredictionService _prediction;

    public ReportService(AppDbContext db, IPredictionService prediction)
    {
        _db = db;
        _prediction = prediction;
    }

    public async Task<List<AttendanceReportItem>> GetAttendanceVsRegistrationAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();

        var report = new List<AttendanceReportItem>();

        foreach (var ev in events)
        {
            int total = ev.Registrations.Count;
            int active = ev.Registrations.Count(r => r.Status == "Registered");
            int cancelled = ev.Registrations.Count(r => r.Status == "Cancelled");

            int predicted = 0;
            try
            {
                var pred = await _prediction.PredictAttendanceAsync(ev.Id);
                predicted = pred.PredictedAttendance;
            }
            catch { /* prediction optional - don't fail report */ }

            report.Add(new AttendanceReportItem
            {
                EventId = ev.Id,
                EventTitle = ev.Title,
                EventType = ev.EventType,
                EventDate = ev.EventDate,
                TotalRegistrations = total,
                ActiveRegistrations = active,
                CancelledRegistrations = cancelled,
                CancellationRate = total > 0 ? Math.Round((double)cancelled / total * 100, 2) : 0,
                PredictedAttendance = predicted
            });
        }

        return report;
    }

    public async Task<RegistrationStatusReport> GetCancelledVsRegisteredAsync()
    {
        var regs = await _db.Registrations.ToListAsync();

        int total = regs.Count;
        int registered = regs.Count(r => r.Status == "Registered");
        int cancelled = regs.Count(r => r.Status == "Cancelled");

        return new RegistrationStatusReport
        {
            TotalRegistrations = total,
            Registered = registered,
            Cancelled = cancelled,
            CancellationRate = total > 0 ? Math.Round((double)cancelled / total * 100, 2) : 0
        };
    }

    public async Task<List<EventPerformanceReport>> GetEventPerformanceAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();

        return events.Select(ev =>
        {
            int active = ev.Registrations.Count(r => r.Status == "Registered");
            double fillRate = ev.LocationCapacity > 0
                ? Math.Round((double)active / ev.LocationCapacity * 100, 2)
                : 0;

            return new EventPerformanceReport
            {
                EventId = ev.Id,
                EventTitle = ev.Title,
                Department = ev.Department,
                Mode = ev.Mode,
                LocationCapacity = ev.LocationCapacity,
                ActiveRegistrations = active,
                FillRate = fillRate,
                SpeakerRating = ev.SpeakerRating,
                TicketPrice = ev.TicketPrice,
                PastAttendanceRate = ev.PastAttendanceRate
            };
        }).ToList();
    }
}
