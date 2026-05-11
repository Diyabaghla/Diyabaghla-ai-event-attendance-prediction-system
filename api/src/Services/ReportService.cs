using Microsoft.EntityFrameworkCore;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;

namespace EventPredictionAPI.Services;

public interface IReportService
{
    Task<List<AttendanceReportItem>>   GetAttendanceVsRegistrationAsync();
    Task<RegistrationStatusReport>     GetCancelledVsRegisteredAsync();
    Task<List<EventPerformanceReport>> GetEventPerformanceAsync();
    Task<TopStatsReport>               GetTopStatsAsync();
    Task<DepartmentBreakdownReport>    GetDepartmentBreakdownAsync();
    Task<List<WeeklyTrendItem>>        GetWeeklyTrendAsync();
}

public class ReportService : IReportService
{
    private readonly AppDbContext      _db;
    private readonly IPredictionService _prediction;

    public ReportService(AppDbContext db, IPredictionService prediction)
    { _db = db; _prediction = prediction; }

    // ── 1. Attendance vs Registration ─────────────────────────
    public async Task<List<AttendanceReportItem>> GetAttendanceVsRegistrationAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();

        var report = new List<AttendanceReportItem>();
        foreach (var ev in events)
        {
            int total     = ev.Registrations.Count;
            int active    = ev.Registrations.Count(r => r.Status == "Registered");
            int cancelled = ev.Registrations.Count(r => r.Status == "Cancelled");
            int predicted = 0;
            try { var p = await _prediction.PredictAttendanceAsync(ev.Id); predicted = p.PredictedAttendance; }
            catch { }
            report.Add(new AttendanceReportItem
            {
                EventId                = ev.Id,
                EventTitle             = ev.Title,
                EventType              = ev.EventType,
                EventDate              = ev.EventDate,
                TotalRegistrations     = total,
                ActiveRegistrations    = active,
                CancelledRegistrations = cancelled,
                CancellationRate       = total > 0 ? Math.Round((double)cancelled / total * 100, 2) : 0,
                PredictedAttendance    = predicted
            });
        }
        return report;
    }

    // ── 2. Cancelled vs Registered ────────────────────────────
    public async Task<RegistrationStatusReport> GetCancelledVsRegisteredAsync()
    {
        var regs       = await _db.Registrations.ToListAsync();
        int total      = regs.Count;
        int registered = regs.Count(r => r.Status == "Registered");
        int cancelled  = regs.Count(r => r.Status == "Cancelled");
        return new RegistrationStatusReport
        {
            TotalRegistrations = total,
            Registered         = registered,
            Cancelled          = cancelled,
            CancellationRate   = total > 0 ? Math.Round((double)cancelled / total * 100, 2) : 0
        };
    }

    // ── 3. Event Performance ──────────────────────────────────
    public async Task<List<EventPerformanceReport>> GetEventPerformanceAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();

        return events.Select(ev =>
        {
            int active   = ev.Registrations.Count(r => r.Status == "Registered");
            double fill  = ev.LocationCapacity > 0
                ? Math.Round((double)active / ev.LocationCapacity * 100, 2) : 0;
            return new EventPerformanceReport
            {
                EventId             = ev.Id,
                EventTitle          = ev.Title,
                Department          = ev.Department,
                Mode                = ev.Mode,
                LocationCapacity    = ev.LocationCapacity,
                ActiveRegistrations = active,
                FillRate            = fill,
                SpeakerRating       = ev.SpeakerRating,
                TicketPrice         = ev.TicketPrice,
                PastAttendanceRate  = ev.PastAttendanceRate
            };
        }).ToList();
    }

    // ── 4. Top Stats ──────────────────────────────────────────
    public async Task<TopStatsReport> GetTopStatsAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .ToListAsync();
        var regs = await _db.Registrations.ToListAsync();

        int totalRegs   = regs.Count;
        int activeRegs  = regs.Count(r => r.Status == "Registered");
        int cancelRegs  = regs.Count(r => r.Status == "Cancelled");

        // avg fill rate across all events
        var fills = events
            .Where(e => e.LocationCapacity > 0)
            .Select(e => (double)e.Registrations.Count(r => r.Status == "Registered") / e.LocationCapacity * 100)
            .ToList();
        double avgFill = fills.Any() ? Math.Round(fills.Average(), 2) : 0;

        // top event by fill rate
        var topEv = events
            .Where(e => e.LocationCapacity > 0)
            .OrderByDescending(e => (double)e.Registrations.Count(r => r.Status == "Registered") / e.LocationCapacity)
            .FirstOrDefault();

        int topActive  = topEv?.Registrations.Count(r => r.Status == "Registered") ?? 0;
        double topFill = topEv != null && topEv.LocationCapacity > 0
            ? Math.Round((double)topActive / topEv.LocationCapacity * 100, 2) : 0;

        return new TopStatsReport
        {
            TotalRegistrations = totalRegs,
            ActiveRegistrations= activeRegs,
            CancelledRegistrations = cancelRegs,
            AvgFillRate        = avgFill,
            TopEventId         = topEv?.Id,
            TopEventTitle      = topEv?.Title ?? "—",
            TopEventDepartment = topEv?.Department ?? "—",
            TopEventMode       = topEv?.Mode ?? "—",
            TopEventFillRate   = topFill,
            TopEventAttendees  = topActive,
            TopEventRating     = topEv?.SpeakerRating ?? 0
        };
    }

    // ── 5. Department Breakdown ───────────────────────────────
    public async Task<DepartmentBreakdownReport> GetDepartmentBreakdownAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .ToListAsync();

        var byDept = events
            .GroupBy(e => e.Department)
            .Select(g =>
            {
                int totalReg  = g.Sum(e => e.Registrations.Count);
                int activeReg = g.Sum(e => e.Registrations.Count(r => r.Status == "Registered"));
                double avgRat = g.Average(e => e.SpeakerRating);
                return new DepartmentItem
                {
                    Department          = g.Key,
                    TotalEvents         = g.Count(),
                    TotalRegistrations  = totalReg,
                    ActiveRegistrations = activeReg,
                    AvgSpeakerRating    = Math.Round(avgRat, 2)
                };
            })
            .OrderByDescending(d => d.TotalRegistrations)
            .ToList();

        var byMode = events
            .GroupBy(e => e.Mode)
            .Select(g =>
            {
                int count = g.Count();
                return new ModeItem
                {
                    Mode       = g.Key,
                    EventCount = count,
                    Percentage = events.Count > 0
                        ? (int)Math.Round((double)count / events.Count * 100) : 0
                };
            })
            .OrderByDescending(m => m.EventCount)
            .ToList();

        return new DepartmentBreakdownReport
        {
            ByDepartment = byDept,
            ByMode       = byMode
        };
    }

    // ── 6. Weekly Trend ───────────────────────────────────────
    public async Task<List<WeeklyTrendItem>> GetWeeklyTrendAsync()
    {
        var regs = await _db.Registrations
            .Include(r => r.Event)
            .ToListAsync();

        if (!regs.Any()) return new List<WeeklyTrendItem>();

        var grouped = regs
            .GroupBy(r =>
            {
                var d = r.RegistrationDate.Date;
                // ISO week start = Monday
                int diff = (7 + (int)d.DayOfWeek - (int)DayOfWeek.Monday) % 7;
                return d.AddDays(-diff);
            })
            .OrderBy(g => g.Key)
            .Select(g => new WeeklyTrendItem
            {
                WeekStart     = g.Key,
                WeekLabel     = g.Key.ToString("MMM dd"),
                Registrations = g.Count(r => r.Status == "Registered"),
                Cancellations = g.Count(r => r.Status == "Cancelled"),
                NetRegistrations = g.Count(r => r.Status == "Registered")
                                 - g.Count(r => r.Status == "Cancelled")
            })
            .ToList();

        return grouped;
    }
}
