using System.ComponentModel.DataAnnotations;

namespace EventPredictionAPI.DTOs;

// ─────────────────────────────────────────────
// Auth DTOs
// ─────────────────────────────────────────────
public class SignupRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

// ─────────────────────────────────────────────
// Event DTOs
// ─────────────────────────────────────────────
public class CreateEventRequest
{
    [Required] public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required] public string EventType { get; set; } = string.Empty;
    // [Required] public string Mode { get; set; } = string.Empty;
    [Required]
[RegularExpression("^(Online|Offline|Hybrid)$",
    ErrorMessage = "Mode must be Online, Offline, or Hybrid")]
public string Mode { get; set; } = string.Empty;

    [Required] public string Department { get; set; } = string.Empty;
    [Required] public DateTime EventDate { get; set; }
    [Range(0.5, 24)] public double DurationHours { get; set; }
    [Range(0, 5)] public double SpeakerRating { get; set; }
    public bool ReminderSent { get; set; }
    [Range(0, 1)] public double PastAttendanceRate { get; set; }
    public string Weather { get; set; } = "Clear";
    [Range(0, double.MaxValue)] public decimal TicketPrice { get; set; }
    [Range(1, int.MaxValue)] public int LocationCapacity { get; set; }
}

public class UpdateEventRequest : CreateEventRequest { }

public class EventResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public double DurationHours { get; set; }
    public double SpeakerRating { get; set; }
    public bool ReminderSent { get; set; }
    public double PastAttendanceRate { get; set; }
    public string Weather { get; set; } = string.Empty;
    public decimal TicketPrice { get; set; }
    public int LocationCapacity { get; set; }
    public int TotalRegistrations { get; set; }
    public int ActiveRegistrations { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ─────────────────────────────────────────────
// Registration DTOs
// ─────────────────────────────────────────────
public class RegisterRequest
{
    [Required] public int EventId { get; set; }
    [Range(0, 1)] public double PastUserAttendanceRate { get; set; } = 0.5;
}

public class RegistrationResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DaysBeforeRegistration { get; set; }
    public double PastUserAttendanceRate { get; set; }
}

// ─────────────────────────────────────────────
// Prediction DTOs (mirror FastAPI contracts)
// ─────────────────────────────────────────────
public class AttendancePredictionRequest
{
    public string EventType { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int Registrations { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public double DurationHours { get; set; }
    public double SpeakerRating { get; set; }
    public bool ReminderSent { get; set; }
    public double PastAttendanceRate { get; set; }
    public string Weather { get; set; } = string.Empty;
    public double TicketPrice { get; set; }
    public int LocationCapacity { get; set; }
}

public class AttendancePredictionResponse
{
    public int PredictedAttendance { get; set; }
}

public class NoShowPredictionRequest
{
    public string EventType { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string DayOfWeek { get; set; } = string.Empty;
    public double PastUserAttendanceRate { get; set; }
    public int DaysBeforeRegistration { get; set; }
    public bool ReminderSent { get; set; }
}

public class NoShowPredictionResponse
{
    public string Prediction { get; set; } = string.Empty;
    public double Probability { get; set; }
}

public class UserAttendancePredictionResponse
{
    public double Probability { get; set; }
}

// ─────────────────────────────────────────────
// Report DTOs
// ─────────────────────────────────────────────
public class AttendanceReportItem
{
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int TotalRegistrations { get; set; }
    public int ActiveRegistrations { get; set; }
    public int CancelledRegistrations { get; set; }
    public double CancellationRate { get; set; }
    public int PredictedAttendance { get; set; }
}

public class RegistrationStatusReport
{
    public int TotalRegistrations { get; set; }
    public int Registered { get; set; }
    public int Cancelled { get; set; }
    public double CancellationRate { get; set; }
}

public class EventPerformanceReport
{
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public int LocationCapacity { get; set; }
    public int ActiveRegistrations { get; set; }
    public double FillRate { get; set; }
    public double SpeakerRating { get; set; }
    public decimal TicketPrice { get; set; }
    public double PastAttendanceRate { get; set; }
}
public class DepartmentReport
{
    public List<DepartmentItem>  ByDepartment { get; set; } = new();
    public List<ModeItem>        ByMode       { get; set; } = new();
    public List<EventTypeItem>   ByEventType  { get; set; } = new();
}
public class EventTypeItem
{
    public string EventType  { get; set; } = "";
    public int    EventCount { get; set; }
    public double AvgRating  { get; set; }
}
public class TopStatsReport
{
    public int    TotalRegistrations    { get; set; }
    public int    ActiveRegistrations   { get; set; }
    public int    CancelledRegistrations{ get; set; }
    public double AvgFillRate           { get; set; }
    public int?   TopEventId            { get; set; }
    public string TopEventTitle         { get; set; } = "";
    public string TopEventDepartment    { get; set; } = "";
    public string TopEventMode          { get; set; } = "";
    public double TopEventFillRate      { get; set; }
    public int    TopEventAttendees     { get; set; }
    public double TopEventRating        { get; set; }
}

public class DepartmentItem
{
    public string Department          { get; set; } = "";
    public int    TotalEvents         { get; set; }
    public int    TotalRegistrations  { get; set; }
    public int    ActiveRegistrations { get; set; }
    public double AvgSpeakerRating    { get; set; }
}

public class ModeItem
{
    public string Mode       { get; set; } = "";
    public int    EventCount { get; set; }
    public int    Percentage { get; set; }
}

public class DepartmentBreakdownReport
{
    public List<DepartmentItem> ByDepartment { get; set; } = new();
    public List<ModeItem>       ByMode       { get; set; } = new();
    public List<EventTypeItem>  ByEventType  { get; set; } = new(); 
}

public class WeeklyTrendItem
{
    public DateTime WeekStart        { get; set; }
    public string   WeekLabel        { get; set; } = "";
    public int      Registrations    { get; set; }
    public int      Cancellations    { get; set; }
    public int      NetRegistrations { get; set; }
}