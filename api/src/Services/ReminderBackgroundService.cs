using EventPredictionAPI.Data;
using EventPredictionAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EventPredictionAPI.Services;

public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReminderBackgroundService> _log;

    // Track sent reminders: eventId → set of userIds
    private readonly Dictionary<int, HashSet<int>> _sentReminders = new();

    public ReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReminderBackgroundService> log)
    {
        _scopeFactory = scopeFactory;
        _log          = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("ReminderBackgroundService started.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try   { await CheckAndSendReminders(); }
            catch (Exception ex) { _log.LogError(ex, "Error in reminder check."); }
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CheckAndSendReminders()
    {
        using var scope = _scopeFactory.CreateScope();
        var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailSvc    = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var tomorrow         = DateTime.UtcNow.Date.AddDays(1);
        var dayAfterTomorrow = tomorrow.AddDays(1);

        // Get events happening tomorrow
        var tomorrowEvents = await db.Events
            .Include(e => e.Registrations)
            .Where(e => e.EventDate.Date >= tomorrow && e.EventDate.Date < dayAfterTomorrow)
            .ToListAsync();

        foreach (var ev in tomorrowEvents)
        {
            if (!_sentReminders.ContainsKey(ev.Id))
                _sentReminders[ev.Id] = new HashSet<int>();

            var activeRegs = ev.Registrations
                .Where(r => r.Status == "Registered")
                .ToList();

            foreach (var reg in activeRegs)
            {
                // Skip if reminder already sent for this user+event
                if (_sentReminders[ev.Id].Contains(reg.UserId)) continue;

                // ✅ Fetch user directly from DB — no UserManager needed
                var user = await db.Users.FindAsync(reg.UserId);
                if (user == null || string.IsNullOrEmpty(user.Email)) continue;

                await emailSvc.SendEventReminderAsync(
                    user.Email,
                    user.FullName,
                    ev);

                _sentReminders[ev.Id].Add(reg.UserId);
                _log.LogInformation(
                    "Reminder sent to {Email} for event {Title}",
                    user.Email, ev.Title);
            }
        }
    }
}