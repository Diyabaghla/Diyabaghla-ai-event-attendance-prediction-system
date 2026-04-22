using System.Net.Http.Json;
using System.Text.Json;
using EventPredictionAPI.Data;
using EventPredictionAPI.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EventPredictionAPI.Services;

public interface IPredictionService
{
    Task<AttendancePredictionResponse> PredictAttendanceAsync(int eventId);
    Task<NoShowPredictionResponse> PredictNoShowAsync(int eventId, int userId);
    Task<UserAttendancePredictionResponse> PredictUserAttendanceAsync(int eventId, int userId);
}

public class PredictionService : IPredictionService
{
    private readonly HttpClient _http;
    private readonly AppDbContext _db;
    private readonly ILogger<PredictionService> _logger;

    // FastAPI uses snake_case; configure JSON serializer accordingly
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public PredictionService(IHttpClientFactory factory, AppDbContext db, ILogger<PredictionService> logger)
    {
        _http = factory.CreateClient("FastAPI");
        _db = db;
        _logger = logger;
    }

    // ── /predict-attendance ───────────────────────────────────────
    public async Task<AttendancePredictionResponse> PredictAttendanceAsync(int eventId)
    {
        var ev = await _db.Events
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found.");

        var payload = new
        {
            event_type = ev.EventType,
            mode = ev.Mode,
            department = ev.Department,
            registrations = ev.Registrations.Count(r => r.Status == "Registered"),
            day_of_week = ev.DayOfWeek,
            duration_hours = ev.DurationHours,
            speaker_rating = ev.SpeakerRating,
            reminder_sent = ev.ReminderSent,
            past_attendance_rate = ev.PastAttendanceRate,
            weather = ev.Weather,
            ticket_price = (double)ev.TicketPrice,
            location_capacity = ev.LocationCapacity
        };

        return await PostAsync<AttendancePredictionResponse>("/predict-attendance", payload);
    }

    // ── /predict-no-show ──────────────────────────────────────────
    public async Task<NoShowPredictionResponse> PredictNoShowAsync(int eventId, int userId)
    {
        var (ev, reg) = await GetEventAndRegistration(eventId, userId);

        var payload = new
        {
            event_type = ev.EventType,
            mode = ev.Mode,
            department = ev.Department,
            day_of_week = ev.DayOfWeek,
            past_user_attendance_rate = reg.PastUserAttendanceRate,
            days_before_registration = reg.DaysBeforeRegistration,
            reminder_sent = ev.ReminderSent
        };

        return await PostAsync<NoShowPredictionResponse>("/predict-no-show", payload);
    }

    // ── /predict-user-attendance ─────────────────────────────────
    public async Task<UserAttendancePredictionResponse> PredictUserAttendanceAsync(int eventId, int userId)
    {
        var (ev, reg) = await GetEventAndRegistration(eventId, userId);

        var payload = new
        {
            event_type = ev.EventType,
            mode = ev.Mode,
            department = ev.Department,
            day_of_week = ev.DayOfWeek,
            past_user_attendance_rate = reg.PastUserAttendanceRate,
            days_before_registration = reg.DaysBeforeRegistration,
            reminder_sent = ev.ReminderSent
        };

        return await PostAsync<UserAttendancePredictionResponse>("/predict-user-attendance", payload);
    }

    // ── Helpers ──────────────────────────────────────────────────
    private async Task<(Models.Event ev, Models.Registration reg)> GetEventAndRegistration(int eventId, int userId)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found.");

        var reg = await _db.Registrations
            .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId)
            ?? throw new KeyNotFoundException("No registration found for this user and event.");

        return (ev, reg);
    }

    private async Task<T> PostAsync<T>(string endpoint, object payload)
    {
        try
        {
            var response = await _http.PostAsJsonAsync(endpoint, payload, _jsonOptions);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
            return result ?? throw new InvalidOperationException("Empty response from prediction service.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "FastAPI call failed for {Endpoint}", endpoint);
            throw new InvalidOperationException($"Prediction service unavailable: {ex.Message}");
        }
    }
}
