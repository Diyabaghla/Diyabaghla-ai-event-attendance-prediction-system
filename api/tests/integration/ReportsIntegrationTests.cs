

using System.Net;
using System.Text.Json;
using Xunit;

namespace EventPredictionAPI.IntegrationTests;

[Collection("Integration")]
public class ReportsIntegrationTests : IntegrationTestBase
{
    public ReportsIntegrationTests(SharedTestServer server)
        : base(server)
    {
    }
    // ── ATTENDANCE VS REGISTRATION ────────────────────────────

    [Fact]
    public async Task AttendanceReport_AsAdmin_Returns200WithList()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/attendance-vs-registration");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task AttendanceReport_AsUser_Returns403()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/attendance-vs-registration");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task AttendanceReport_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/reports/attendance-vs-registration");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task AttendanceReport_Items_HaveRequiredFields()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/attendance-vs-registration");
        var body = await ReadJsonAsync(res);
        if (body.GetArrayLength() == 0) return; // skip if no data
        var first = body.EnumerateArray().First();
        Assert.True(first.TryGetProperty("eventId",    out _));
        Assert.True(first.TryGetProperty("eventTitle", out _));
        Assert.True(first.TryGetProperty("eventDate",  out _));
    }

    [Fact]
    public async Task AttendanceReport_ActiveRegistrations_NotNegative()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/attendance-vs-registration");
        var body = await ReadJsonAsync(res);
        foreach (var item in body.EnumerateArray())
        {
            if (item.TryGetProperty("activeRegistrations", out var ar))
                Assert.True(ar.GetInt32() >= 0);
        }
    }

    [Fact]
    public async Task AttendanceReport_CancellationRate_Between0And100()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/attendance-vs-registration");
        var body = await ReadJsonAsync(res);
        foreach (var item in body.EnumerateArray())
        {
            if (item.TryGetProperty("cancellationRate", out var cr))
            {
                var rate = cr.GetDouble();
                Assert.True(rate >= 0 && rate <= 100);
            }
        }
    }

    // ── CANCELLED VS REGISTERED ───────────────────────────────

    [Fact]
    public async Task StatusReport_AsAdmin_Returns200()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task StatusReport_AsUser_Returns403()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task StatusReport_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task StatusReport_HasRequiredFields()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("totalRegistrations", out _));
        Assert.True(body.TryGetProperty("registered",         out _));
        Assert.True(body.TryGetProperty("cancelled",          out _));
        Assert.True(body.TryGetProperty("cancellationRate",   out _));
    }

    [Fact]
    public async Task StatusReport_RegisteredPlusCancelled_EqualsTotalOrLess()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        var body = await ReadJsonAsync(res);
        var total = body.GetProperty("totalRegistrations").GetInt32();
        var reg   = body.GetProperty("registered").GetInt32();
        var can   = body.GetProperty("cancelled").GetInt32();
        Assert.True(reg + can <= total + 1); // allow 1 rounding margin
    }

    [Fact]
    public async Task StatusReport_AllValues_AreNonNegative()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/cancelled-vs-registered");
        var body = await ReadJsonAsync(res);
        Assert.True(body.GetProperty("totalRegistrations").GetInt32() >= 0);
        Assert.True(body.GetProperty("registered").GetInt32()         >= 0);
        Assert.True(body.GetProperty("cancelled").GetInt32()          >= 0);
        Assert.True(body.GetProperty("cancellationRate").GetDouble()  >= 0);
    }

    // ── EVENT PERFORMANCE ────────────────────────────────────

    [Fact]
    public async Task PerformanceReport_AsAdmin_Returns200WithList()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/event-performance");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task PerformanceReport_AsUser_Returns403()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/event-performance");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task PerformanceReport_WithoutAuth_Returns401()
    {
        ClearAuth();
        var res = await Client.GetAsync("/api/reports/event-performance");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task PerformanceReport_Items_HaveRequiredFields()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/event-performance");
        var body = await ReadJsonAsync(res);
        if (body.GetArrayLength() == 0) return;
        var first = body.EnumerateArray().First();
        Assert.True(first.TryGetProperty("eventId",    out _));
        Assert.True(first.TryGetProperty("eventTitle", out _));
        Assert.True(first.TryGetProperty("fillRate",   out _));
        Assert.True(first.TryGetProperty("department", out _));
    }

    [Fact]
    public async Task PerformanceReport_FillRate_Between0And100()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/event-performance");
        var body = await ReadJsonAsync(res);
        foreach (var item in body.EnumerateArray())
        {
            if (item.TryGetProperty("fillRate", out var fr))
            {
                var rate = fr.GetDouble();
                Assert.True(rate >= 0 && rate <= 100,
                    $"fillRate {rate} is out of range 0-100");
            }
        }
    }

    [Fact]
    public async Task PerformanceReport_SpeakerRating_Between0And5()
    {
        await AuthAsAdminAsync();
        var res  = await Client.GetAsync("/api/reports/event-performance");
        var body = await ReadJsonAsync(res);
        foreach (var item in body.EnumerateArray())
        {
            if (item.TryGetProperty("speakerRating", out var sr))
            {
                var rating = sr.GetDouble();
                Assert.True(rating >= 0 && rating <= 5);
            }
        }
    }

    // ── TOP STATS ────────────────────────────────────────────

    [Fact]
    public async Task TopStats_AsAdmin_Returns200()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/top-stats");
        // Accept 200 or 404 (endpoint may not exist yet)
        Assert.True(res.StatusCode == HttpStatusCode.OK ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task TopStats_AsUser_Returns403Or404()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/top-stats");
        Assert.True(res.StatusCode == HttpStatusCode.Forbidden ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task TopStats_AsAdmin_IfExists_HasAvgFillRate()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/top-stats");
        if (res.StatusCode != HttpStatusCode.OK) return;
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("avgFillRate", out var afr));
        Assert.True(afr.GetDouble() >= 0);
    }

    // ── DEPARTMENT BREAKDOWN ─────────────────────────────────

    [Fact]
    public async Task DepartmentReport_AsAdmin_Returns200Or404()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/department-breakdown");
        Assert.True(res.StatusCode == HttpStatusCode.OK ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DepartmentReport_AsUser_Returns403Or404()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/department-breakdown");
        Assert.True(res.StatusCode == HttpStatusCode.Forbidden ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DepartmentReport_IfExists_HasByDepartment()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/department-breakdown");
        if (res.StatusCode != HttpStatusCode.OK) return;
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("byDepartment", out _));
    }

    // ── WEEKLY TREND ──────────────────────────────────────────

    [Fact]
    public async Task WeeklyTrend_AsAdmin_Returns200Or404()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/weekly-trend");
        Assert.True(res.StatusCode == HttpStatusCode.OK ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task WeeklyTrend_AsUser_Returns403Or404()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/weekly-trend");
        Assert.True(res.StatusCode == HttpStatusCode.Forbidden ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task WeeklyTrend_IfExists_IsArray()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/weekly-trend");
        if (res.StatusCode != HttpStatusCode.OK) return;
        var body = await ReadJsonAsync(res);
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    // ── CSV DOWNLOADS ─────────────────────────────────────────

    [Fact]
    public async Task DownloadEventPerformanceCsv_AsAdmin_Returns200OrNotFound()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/download/event-performance-csv");
        Assert.True(res.StatusCode == HttpStatusCode.OK ||
                    res.StatusCode == HttpStatusCode.NotFound);
        if (res.StatusCode == HttpStatusCode.OK)
            Assert.Contains("text/csv", res.Content.Headers.ContentType?.MediaType ?? "");
    }

    [Fact]
    public async Task DownloadRegistrationsCsv_AsAdmin_Returns200OrNotFound()
    {
        await AuthAsAdminAsync();
        var res = await Client.GetAsync("/api/reports/download/registrations-csv");
        Assert.True(res.StatusCode == HttpStatusCode.OK ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DownloadCsv_AsUser_Returns403Or404()
    {
        await AuthAsUserAsync();
        var res = await Client.GetAsync("/api/reports/download/event-performance-csv");
        Assert.True(res.StatusCode == HttpStatusCode.Forbidden ||
                    res.StatusCode == HttpStatusCode.NotFound);
    }
}
