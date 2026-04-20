using Microsoft.EntityFrameworkCore;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Models;

namespace EventPredictionAPI.Services;

public interface IRegistrationService
{
    Task<RegistrationResponse> RegisterAsync(int userId, RegisterRequest request);
    Task<RegistrationResponse> CancelAsync(int userId, int registrationId);
    Task<List<RegistrationResponse>> GetByUserAsync(int userId);
    Task<List<RegistrationResponse>> GetByEventAsync(int eventId);
    Task<List<RegistrationResponse>> GetAllAsync();
}

public class RegistrationService : IRegistrationService
{
    private readonly AppDbContext _db;

    public RegistrationService(AppDbContext db) => _db = db;

    public async Task<RegistrationResponse> RegisterAsync(int userId, RegisterRequest req)
    {
        var ev = await _db.Events.FindAsync(req.EventId)
            ?? throw new KeyNotFoundException($"Event {req.EventId} not found.");

        var existing = await _db.Registrations
            .FirstOrDefaultAsync(r => r.UserId == userId && r.EventId == req.EventId);

        if (existing != null)
        {
            if (existing.Status == "Registered")
                throw new InvalidOperationException("You are already registered for this event.");

            // Re-register (was cancelled)
            existing.Status = "Registered";
            existing.RegistrationDate = DateTime.UtcNow;
            existing.PastUserAttendanceRate = req.PastUserAttendanceRate;
            existing.DaysBeforeRegistration = Math.Max(0, (ev.EventDate - DateTime.UtcNow).Days);
            await _db.SaveChangesAsync();
            return await MapAsync(existing.Id);
        }

        var reg = new Registration
        {
            UserId = userId,
            EventId = req.EventId,
            Status = "Registered",
            PastUserAttendanceRate = req.PastUserAttendanceRate,
            DaysBeforeRegistration = Math.Max(0, (ev.EventDate - DateTime.UtcNow).Days)
        };

        _db.Registrations.Add(reg);
        await _db.SaveChangesAsync();
        return await MapAsync(reg.Id);
    }

    public async Task<RegistrationResponse> CancelAsync(int userId, int registrationId)
    {
        var reg = await _db.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .FirstOrDefaultAsync(r => r.Id == registrationId && r.UserId == userId)
            ?? throw new KeyNotFoundException("Registration not found.");

        if (reg.Status == "Cancelled")
            throw new InvalidOperationException("Registration is already cancelled.");

        reg.Status = "Cancelled";
        await _db.SaveChangesAsync();
        return MapToResponse(reg);
    }

    public async Task<List<RegistrationResponse>> GetByUserAsync(int userId)
    {
        var regs = await _db.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.RegistrationDate)
            .ToListAsync();

        return regs.Select(MapToResponse).ToList();
    }

    public async Task<List<RegistrationResponse>> GetByEventAsync(int eventId)
    {
        var regs = await _db.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.RegistrationDate)
            .ToListAsync();

        return regs.Select(MapToResponse).ToList();
    }

    public async Task<List<RegistrationResponse>> GetAllAsync()
    {
        var regs = await _db.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .OrderByDescending(r => r.RegistrationDate)
            .ToListAsync();

        return regs.Select(MapToResponse).ToList();
    }

    private async Task<RegistrationResponse> MapAsync(int id)
    {
        var reg = await _db.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .FirstAsync(r => r.Id == id);
        return MapToResponse(reg);
    }

    private static RegistrationResponse MapToResponse(Registration r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        UserName = r.User.FullName,
        UserEmail = r.User.Email,
        EventId = r.EventId,
        EventTitle = r.Event.Title,
        RegistrationDate = r.RegistrationDate,
        Status = r.Status,
        DaysBeforeRegistration = r.DaysBeforeRegistration,
        PastUserAttendanceRate = r.PastUserAttendanceRate
    };
}
