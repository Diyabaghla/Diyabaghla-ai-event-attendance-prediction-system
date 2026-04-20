using Microsoft.EntityFrameworkCore;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;
using EventPredictionAPI.Models;

namespace EventPredictionAPI.Services;

public interface IEventService
{
    Task<EventResponse> CreateAsync(CreateEventRequest request);
    Task<List<EventResponse>> GetAllAsync();
    Task<EventResponse> GetByIdAsync(int id);
    Task<EventResponse> UpdateAsync(int id, UpdateEventRequest request);
    Task DeleteAsync(int id);
}

public class EventService : IEventService
{
    private readonly AppDbContext _db;

    public EventService(AppDbContext db) => _db = db;

    public async Task<EventResponse> CreateAsync(CreateEventRequest req)
    {
        var ev = new Event
        {
            Title = req.Title,
            Description = req.Description,
            EventType = req.EventType,
            Mode = req.Mode,
            Department = req.Department,
            EventDate = req.EventDate,
            DayOfWeek = req.EventDate.DayOfWeek.ToString(),
            DurationHours = req.DurationHours,
            SpeakerRating = req.SpeakerRating,
            ReminderSent = req.ReminderSent,
            PastAttendanceRate = req.PastAttendanceRate,
            Weather = req.Weather,
            TicketPrice = req.TicketPrice,
            LocationCapacity = req.LocationCapacity
        };

        _db.Events.Add(ev);
        await _db.SaveChangesAsync();
        return MapToResponse(ev, 0, 0);
    }

    public async Task<List<EventResponse>> GetAllAsync()
    {
        var events = await _db.Events
            .Include(e => e.Registrations)
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();

        return events.Select(e => MapToResponse(e,
            e.Registrations.Count,
            e.Registrations.Count(r => r.Status == "Registered")
        )).ToList();
    }

    public async Task<EventResponse> GetByIdAsync(int id)
    {
        var ev = await _db.Events
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new KeyNotFoundException($"Event {id} not found.");

        return MapToResponse(ev,
            ev.Registrations.Count,
            ev.Registrations.Count(r => r.Status == "Registered"));
    }

    public async Task<EventResponse> UpdateAsync(int id, UpdateEventRequest req)
    {
        var ev = await _db.Events.FindAsync(id)
            ?? throw new KeyNotFoundException($"Event {id} not found.");

        ev.Title = req.Title;
        ev.Description = req.Description;
        ev.EventType = req.EventType;
        ev.Mode = req.Mode;
        ev.Department = req.Department;
        ev.EventDate = req.EventDate;
        ev.DayOfWeek = req.EventDate.DayOfWeek.ToString();
        ev.DurationHours = req.DurationHours;
        ev.SpeakerRating = req.SpeakerRating;
        ev.ReminderSent = req.ReminderSent;
        ev.PastAttendanceRate = req.PastAttendanceRate;
        ev.Weather = req.Weather;
        ev.TicketPrice = req.TicketPrice;
        ev.LocationCapacity = req.LocationCapacity;

        await _db.SaveChangesAsync();
        return MapToResponse(ev, 0, 0);
    }

    public async Task DeleteAsync(int id)
    {
        var ev = await _db.Events.FindAsync(id)
            ?? throw new KeyNotFoundException($"Event {id} not found.");

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
    }

    private static EventResponse MapToResponse(Event ev, int total, int active) => new()
    {
        Id = ev.Id,
        Title = ev.Title,
        Description = ev.Description,
        EventType = ev.EventType,
        Mode = ev.Mode,
        Department = ev.Department,
        EventDate = ev.EventDate,
        DayOfWeek = ev.DayOfWeek,
        DurationHours = ev.DurationHours,
        SpeakerRating = ev.SpeakerRating,
        ReminderSent = ev.ReminderSent,
        PastAttendanceRate = ev.PastAttendanceRate,
        Weather = ev.Weather,
        TicketPrice = ev.TicketPrice,
        LocationCapacity = ev.LocationCapacity,
        TotalRegistrations = total,
        ActiveRegistrations = active,
        CreatedAt = ev.CreatedAt
    };
}
