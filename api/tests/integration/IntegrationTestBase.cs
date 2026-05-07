
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EventPredictionAPI.Data;
using EventPredictionAPI.Models;
using EventPredictionAPI.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace EventPredictionAPI.IntegrationTests;

// ─────────────────────────────────────────────────────────────
// Shared server across ALL integration test classes
// ─────────────────────────────────────────────────────────────

[CollectionDefinition("Integration")]
public class IntegrationCollection : ICollectionFixture<SharedTestServer> { }

public class SharedTestServer : IDisposable
{
    private readonly SqliteConnection _connection;

    public WebApplicationFactory<Program> Factory { get; }

    public SharedTestServer()
    {
        Environment.SetEnvironmentVariable(
            "ASPNETCORE_ENVIRONMENT",
            "Testing"
        );

        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");

                builder.ConfigureServices(services =>
                {
                    // Remove existing DbContext registrations
                    services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
                    services.RemoveAll(typeof(AppDbContext));

                    // Remove any existing EF provider registrations
                    var descriptors = services
                        .Where(d =>
                            d.ServiceType.FullName != null &&
                            d.ServiceType.FullName.Contains("EntityFramework"))
                        .ToList();

                    foreach (var descriptor in descriptors)
                    {
                        services.Remove(descriptor);
                    }

                    // Register SQLite in-memory database
                    services.AddDbContext<AppDbContext>(options =>
                    {
                        options.UseSqlite(_connection);
                    });

                    // Replace email service with no-op
                    services.RemoveAll<IEmailService>();
                    services.AddScoped<IEmailService, NoOpEmailService>();
                });
            });

        // Create DB schema + seed data
        using var scope = Factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        SeedData(db);
    }

    private static void SeedData(AppDbContext db)
    {
        if (db.Users.Any())
            return;

        db.Users.AddRange(
            new User
            {
                FullName = "Test Admin",
                Email = "admin@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Test User",
                Email = "user@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = "User",
                CreatedAt = DateTime.UtcNow
            }
        );

        db.SaveChanges();

        db.Events.AddRange(
            new Event
            {
                Title = "AI Conference 2026",
                Description = "Annual AI summit",
                EventType = "Conference",
                Mode = "Online",
                Department = "Engineering",
                EventDate = DateTime.UtcNow.AddDays(30),
                DayOfWeek = "Saturday",
                DurationHours = 4.0,
                SpeakerRating = 4.5,
                ReminderSent = false,
                PastAttendanceRate = 0.75,
                Weather = "Clear",
                TicketPrice = 0,
                LocationCapacity = 500,
                CreatedAt = DateTime.UtcNow
            },
            new Event
            {
                Title = "Sales Workshop",
                Description = "Quarterly training",
                EventType = "Workshop",
                Mode = "Offline",
                Department = "Sales",
                EventDate = DateTime.UtcNow.AddDays(10),
                DayOfWeek = "Monday",
                DurationHours = 2.0,
                SpeakerRating = 3.8,
                ReminderSent = false,
                PastAttendanceRate = 0.60,
                Weather = "Cloudy",
                TicketPrice = 25,
                LocationCapacity = 100,
                CreatedAt = DateTime.UtcNow
            }
        );

        db.SaveChanges();
    }

    public void Dispose()
    {
        _connection.Dispose();
        Factory.Dispose();
    }
}

// ─────────────────────────────────────────────────────────────
// No-op email service
// ─────────────────────────────────────────────────────────────

public class NoOpEmailService : IEmailService
{
    public Task SendLoginSuccessAsync(
        string email,
        string name,
        string time,
        string ip
    ) => Task.CompletedTask;

    public Task SendRegistrationConfirmAsync(
        string email,
        string name,
        Event ev,
        DateTime date
    ) => Task.CompletedTask;

    public Task SendEventReminderAsync(
        string email,
        string name,
        Event ev
    ) => Task.CompletedTask;
}

// ─────────────────────────────────────────────────────────────
// Base integration test class
// ─────────────────────────────────────────────────────────────

[Collection("Integration")]
public abstract class IntegrationTestBase : IDisposable
{
    protected readonly HttpClient Client;

    protected static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    protected IntegrationTestBase(SharedTestServer server)
    {
        Client = server.Factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                BaseAddress = new Uri("http://localhost")
            });
    }

    protected async Task<string?> LoginAsync(
        string email,
        string password
    )
    {
        Client.DefaultRequestHeaders.Authorization = null;

        var response = await Client.PostAsync(
            "/api/auth/login",
            MakeJson(new { email, password })
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var json = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync()
        );

        return json.RootElement
            .GetProperty("token")
            .GetString();
    }

    protected async Task AuthAsAdminAsync()
    {
        var token = await LoginAsync(
            "admin@test.com",
            "Admin@123"
        );

        if (token != null)
        {
            Client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }
    }

    protected async Task AuthAsUserAsync()
    {
        var token = await LoginAsync(
            "user@test.com",
            "User@123"
        );

        if (token != null)
        {
            Client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }
    }

    protected void ClearAuth()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    protected static StringContent MakeJson(object obj)
    {
        return new StringContent(
            JsonSerializer.Serialize(obj, JsonOpts),
            Encoding.UTF8,
            "application/json"
        );
    }

    protected static async Task<JsonElement> ReadJsonAsync(
        HttpResponseMessage response
    )
    {
        var body = await response.Content.ReadAsStringAsync();

        return string.IsNullOrWhiteSpace(body)
            ? default
            : JsonDocument.Parse(body).RootElement;
    }

    protected static CreateEventRequest ValidEventRequest(
        string suffix = ""
    ) => new()
    {
        Title = $"Test Event {suffix}",
        Description = "Integration test event",
        EventType = "Conference",
        Mode = "Online",
        Department = "Engineering",
        EventDate = DateTime.UtcNow.AddDays(20),
        DurationHours = 2.0,
        SpeakerRating = 4.0,
        ReminderSent = false,
        PastAttendanceRate = 0.70,
        Weather = "Clear",
        TicketPrice = 0,
        LocationCapacity = 100
    };

    public void Dispose()
    {
        Client.Dispose();
    }
}

// ─────────────────────────────────────────────────────────────
// DTO used only in integration tests
// ─────────────────────────────────────────────────────────────

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string Mode { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    public double DurationHours { get; set; }

    public double SpeakerRating { get; set; }

    public bool ReminderSent { get; set; }

    public double PastAttendanceRate { get; set; }

    public string Weather { get; set; } = "Clear";

    public decimal TicketPrice { get; set; }

    public int LocationCapacity { get; set; }
}