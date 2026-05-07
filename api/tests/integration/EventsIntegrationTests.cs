
using System.Net;
using System.Text.Json;
using Xunit;

namespace EventPredictionAPI.IntegrationTests;

[Collection("Integration")]
public class EventsIntegrationTests : IntegrationTestBase
{
    public EventsIntegrationTests(SharedTestServer server)
        : base(server)
    {
    }
    // ── GET ALL EVENTS ───────────────────────────────────────

    [Fact]
    public async Task GetEvents_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/events");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task GetEvents_AsUser_Returns200WithList()
    {
        await AuthAsUserAsync();
        var res  = await Client.GetAsync("/api/events");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
        Assert.True(body.GetArrayLength() > 0);
    }

    [Fact]
    public async Task GetEvents_AsAdmin_Returns200WithList()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/events");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task GetEvents_EachItem_HasRequiredFields()
    {
        await AuthAsUserAsync();
        var res  = await Client.GetAsync("/api/events");
        var body = await ReadJsonAsync(res);
        var first = body.EnumerateArray().First();
        Assert.True(first.TryGetProperty("id",    out _));
        Assert.True(first.TryGetProperty("title", out _));
        Assert.True(first.TryGetProperty("mode",  out _));
        Assert.True(first.TryGetProperty("eventDate", out _));
    }

    // ── GET SINGLE EVENT ─────────────────────────────────────

    [Fact]
    public async Task GetEvent_ValidId_Returns200()
    {
        await AuthAsUserAsync();
        var listRes = await Client.GetAsync("/api/events");
        var list    = await ReadJsonAsync(listRes);
        var id      = list.EnumerateArray().First().GetProperty("id").GetInt32();

        var res = await Client.GetAsync($"/api/events/{id}");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task GetEvent_InvalidId_Returns404()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/events/999999");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task GetEvent_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/events/1");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // ── CREATE EVENT ─────────────────────────────────────────

    [Fact]
    public async Task CreateEvent_AsAdmin_Returns201()
    {
        await AuthAsAdminAsync();
        var res = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("Create1")));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("id", out var id));
        Assert.True(id.GetInt32() > 0);
    }

    [Fact]
    public async Task CreateEvent_AsUser_Returns403()
    {
        await AuthAsUserAsync();
        var res = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("UserCreate")));
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("NoAuth")));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_MissingTitle_Returns400()
    {
        await AuthAsAdminAsync();
        var ev = ValidEventRequest();
        ev.Title = string.Empty;
        var res = await Client.PostAsync("/api/events", MakeJson(ev));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_InvalidMode_Returns400()
    {
        await AuthAsAdminAsync();
        var res = await Client.PostAsync("/api/events", MakeJson(new
        {
            title = "Bad Mode", eventType = "Conference", mode = "InvalidMode",
            department = "Engineering", eventDate = DateTime.UtcNow.AddDays(10),
            durationHours = 2.0, speakerRating = 4.0, reminderSent = false,
            pastAttendanceRate = 0.7, weather = "Clear", ticketPrice = 0, locationCapacity = 100
        }));
        Assert.True((int)res.StatusCode >= 400);
    }

    [Fact]
    public async Task CreateEvent_Response_ContainsCorrectTitle()
    {
        await AuthAsAdminAsync();
        var req = ValidEventRequest("TitleCheck");
        var res = await Client.PostAsync("/api/events", MakeJson(req));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("title", out var t));
        Assert.Contains("TitleCheck", t.GetString());
    }

    // ── UPDATE EVENT ─────────────────────────────────────────

    [Fact]
    public async Task UpdateEvent_AsAdmin_Returns200()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("ToUpdate")));
        var created = await ReadJsonAsync(createRes);
        var id = created.GetProperty("id").GetInt32();

        var updReq = ValidEventRequest("Updated");
        var res    = await Client.PutAsync($"/api/events/{id}", MakeJson(updReq));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task UpdateEvent_AsUser_Returns403()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("ForUserUpdate")));
        var created = await ReadJsonAsync(createRes);
        var id = created.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var res = await Client.PutAsync($"/api/events/{id}",
            MakeJson(ValidEventRequest("UserUpdate")));
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task UpdateEvent_NonExistent_Returns404()
    {
        await AuthAsAdminAsync();
        var res = await Client.PutAsync("/api/events/999999",
            MakeJson(ValidEventRequest("Ghost")));
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    // ── DELETE EVENT ─────────────────────────────────────────

    [Fact]
    public async Task DeleteEvent_AsAdmin_Returns204Or200()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("ToDelete")));
        var created = await ReadJsonAsync(createRes);
        var id = created.GetProperty("id").GetInt32();

        var res = await Client.DeleteAsync($"/api/events/{id}");
        Assert.True(res.StatusCode == HttpStatusCode.NoContent ||
                    res.StatusCode == HttpStatusCode.OK);
    }

    [Fact]
    public async Task DeleteEvent_AsUser_Returns403()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("ForUserDelete")));
        var created = await ReadJsonAsync(createRes);
        var id = created.GetProperty("id").GetInt32();

        await AuthAsUserAsync();
        var res = await Client.DeleteAsync($"/api/events/{id}");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task DeleteEvent_NonExistent_Returns404()
    {
        await AuthAsAdminAsync();
        var res = await Client.DeleteAsync("/api/events/999999");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task DeleteEvent_ThenGet_Returns404()
    {
        await AuthAsAdminAsync();
        var createRes = await Client.PostAsync("/api/events",
            MakeJson(ValidEventRequest("DeleteThenGet")));
        var created = await ReadJsonAsync(createRes);
        var id = created.GetProperty("id").GetInt32();

        await Client.DeleteAsync($"/api/events/{id}");
        var getRes = await Client.GetAsync($"/api/events/{id}");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }
}
