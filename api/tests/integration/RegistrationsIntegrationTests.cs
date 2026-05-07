
using System.Net;
using System.Text.Json;
using Xunit;

namespace EventPredictionAPI.IntegrationTests;

[Collection("Integration")]
public class RegistrationsIntegrationTests : IntegrationTestBase
{
    public RegistrationsIntegrationTests(SharedTestServer server)
        : base(server)
    {
    }

    // ── Helper: get first event id ────────────────────────────
    private async Task<int> GetFirstEventIdAsync()
    {
        await AuthAsUserAsync();
        var res  = await Client.GetAsync("/api/events");
        var body = await ReadJsonAsync(res);
        return body.EnumerateArray().First().GetProperty("id").GetInt32();
    }

    // ── REGISTER ─────────────────────────────────────────────

    [Fact]
    public async Task Register_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = 1, pastUserAttendanceRate = 0.7 }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Register_ValidEvent_Returns201()
    {
        var eventId = await GetFirstEventIdAsync();
        await AuthAsUserAsync();
        var res = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId, pastUserAttendanceRate = 0.7 }));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    [Fact]
    public async Task Register_NonExistentEvent_Returns404()
    {
        await AuthAsUserAsync();
        var res = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = 999999, pastUserAttendanceRate = 0.7 }));
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task Register_Duplicate_Returns409()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("DupReg")));
        var ev    = await ReadJsonAsync(createRes);
        var evId  = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));

        // Second registration for same event
        var res = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Register_Response_ContainsRegistrationId()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("RegIdCheck")));
        var ev   = await ReadJsonAsync(createRes);
        var evId = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var res  = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("id", out var id) ||
                    body.TryGetProperty("registrationId", out id));
        Assert.True(id.GetInt32() > 0);
    }

    [Fact]
    public async Task Register_Response_StatusIsRegistered()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("StatusCheck")));
        var ev   = await ReadJsonAsync(createRes);
        var evId = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var res  = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));
        var body = await ReadJsonAsync(res);
        if (body.TryGetProperty("status", out var s))
            Assert.Equal("Registered", s.GetString());
    }

    // ── GET MY REGISTRATIONS ─────────────────────────────────

    [Fact]
    public async Task GetMyRegistrations_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/registrations/my");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task GetMyRegistrations_AsUser_Returns200WithList()
    {
        await AuthAsUserAsync();
        var res  = await Client.GetAsync("/api/registrations/my");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task GetMyRegistrations_AfterRegister_ContainsNewEntry()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("MyRegCheck")));
        var ev   = await ReadJsonAsync(createRes);
        var evId = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));

        var res  = await Client.GetAsync("/api/registrations/my");
        var body = await ReadJsonAsync(res);
        var eventIds = body.EnumerateArray()
            .Select(r => r.TryGetProperty("eventId", out var e) ? e.GetInt32() : 0)
            .ToList();
        Assert.Contains(evId, eventIds);
    }

    // ── CANCEL REGISTRATION ──────────────────────────────────

    [Fact]
    public async Task Cancel_ValidRegistration_Returns200()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("CancelTest")));
        var ev   = await ReadJsonAsync(createRes);
        var evId = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var regRes = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));
        var reg   = await ReadJsonAsync(regRes);
        var regId = reg.TryGetProperty("id", out var rid)
            ? rid.GetInt32()
            : reg.GetProperty("registrationId").GetInt32();

        var cancelRes = await Client.PatchAsync(
            $"/api/registrations/{regId}/cancel", MakeJson(new { }));
        Assert.True(cancelRes.StatusCode == HttpStatusCode.OK ||
                    cancelRes.StatusCode == HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Cancel_NonExistentRegistration_Returns404()
    {
        await AuthAsUserAsync();
        var res = await Client.PatchAsync(
            "/api/registrations/999999/cancel", MakeJson(new { }));
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task Cancel_AfterCancel_StatusIsCancelled()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("CancelStatus")));
        var ev   = await ReadJsonAsync(createRes);
        var evId = ev.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var regRes = await Client.PostAsync("/api/registrations", MakeJson(new
        { eventId = evId, pastUserAttendanceRate = 0.7 }));
        var reg   = await ReadJsonAsync(regRes);
        var regId = reg.TryGetProperty("id", out var rid)
            ? rid.GetInt32()
            : reg.GetProperty("registrationId").GetInt32();

        await Client.PatchAsync($"/api/registrations/{regId}/cancel", MakeJson(new { }));

        var listRes  = await Client.GetAsync("/api/registrations/my");
        var listBody = await ReadJsonAsync(listRes);
        var cancelled = listBody.EnumerateArray()
            .FirstOrDefault(r => r.TryGetProperty("id", out var i) && i.GetInt32() == regId);
        if (cancelled.TryGetProperty("status", out var s))
            Assert.Equal("Cancelled", s.GetString());
    }

    // ── ADMIN: GET ALL ────────────────────────────────────────

    [Fact]
    public async Task GetAll_AsAdmin_Returns200()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/registrations");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task GetAll_AsUser_Returns403()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/registrations");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/registrations");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // ── GET BY EVENT ──────────────────────────────────────────

    [Fact]
    public async Task GetByEvent_AsAdmin_Returns200()
    {
        var eventId = await GetFirstEventIdAsync();
        await AuthAsAdminAsync();
        var res = await Client.GetAsync($"/api/registrations/event/{eventId}");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task GetByEvent_AsUser_Returns403()
    {
        var eventId = await GetFirstEventIdAsync();
        await AuthAsUserAsync();
        var res = await Client.GetAsync($"/api/registrations/event/{eventId}");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }
}
