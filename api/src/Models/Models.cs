using System.ComponentModel.DataAnnotations;

namespace EventPredictionAPI.Models;

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────
public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Role { get; set; } = "User"; // Admin | User

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}

// ─────────────────────────────────────────────
// Event
// ─────────────────────────────────────────────
public class Event
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required, MaxLength(100)]
    public string EventType { get; set; } = string.Empty;  // Conference, Workshop, etc.

    [Required, MaxLength(20)]
    public string Mode { get; set; } = string.Empty;        // Online | Offline | Hybrid

    [Required, MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    [MaxLength(20)]
    public string DayOfWeek { get; set; } = string.Empty;

    public double DurationHours { get; set; }

    public double SpeakerRating { get; set; }

    public bool ReminderSent { get; set; }

    public double PastAttendanceRate { get; set; }

    [MaxLength(50)]
    public string Weather { get; set; } = "Clear";

    public decimal TicketPrice { get; set; }

    public int LocationCapacity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}

// ─────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────
public class Registration
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int EventId { get; set; }
    public Event Event { get; set; } = null!;

    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Registered"; // Registered | Cancelled

    public int DaysBeforeRegistration { get; set; }     // calculated on register
    public double PastUserAttendanceRate { get; set; }  // snapshot at registration time
}
