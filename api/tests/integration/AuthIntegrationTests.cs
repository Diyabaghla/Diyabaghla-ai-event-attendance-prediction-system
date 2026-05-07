
using System.Net;
using Xunit;

namespace EventPredictionAPI.IntegrationTests;

[Collection("Integration")]
public class AuthIntegrationTests : IntegrationTestBase
{
     public AuthIntegrationTests(SharedTestServer server) : base(server)
    {
    }
    // ── SIGNUP ───────────────────────────────────────────────

    [Fact]
    public async Task Signup_ValidData_Returns201WithToken()
    {
        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        {
            fullName = "New User",
            email    = $"new_{Guid.NewGuid():N}@test.com",
            password = "Pass@1234"
        }));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("token", out var t));
        Assert.False(string.IsNullOrWhiteSpace(t.GetString()));
    }

    [Fact]
    public async Task Signup_DuplicateEmail_Returns409()
    {
        var email = $"dup_{Guid.NewGuid():N}@test.com";
        await Client.PostAsync("/api/auth/signup", MakeJson(new
        { fullName = "First", email, password = "Pass@1234" }));

        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        { fullName = "Second", email, password = "Pass@9999" }));

        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Signup_MissingEmail_Returns400()
    {
        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        { fullName = "No Email", password = "Pass@1234" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_MissingPassword_Returns400()
    {
        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        { fullName = "No Pass", email = "nopass@test.com" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_ShortPassword_Returns400()
    {
        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        {
            fullName = "Short Pass",
            email    = $"short_{Guid.NewGuid():N}@test.com",
            password = "abc"     // < 6 chars
        }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Signup_NewUser_RoleIsUser()
    {
        var res = await Client.PostAsync("/api/auth/signup", MakeJson(new
        {
            fullName = "Role Check",
            email    = $"role_{Guid.NewGuid():N}@test.com",
            password = "Pass@1234"
        }));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("role", out var r));
        Assert.Equal("User", r.GetString());
    }

    [Fact]
    public async Task Signup_Response_ContainsFullNameAndEmail()
    {
        var email = $"check_{Guid.NewGuid():N}@test.com";
        var res   = await Client.PostAsync("/api/auth/signup", MakeJson(new
        { fullName = "Full Name Check", email, password = "Pass@1234" }));
        var body  = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("fullName", out var fn));
        Assert.True(body.TryGetProperty("email", out var em));
        Assert.Equal("Full Name Check", fn.GetString());
        Assert.Equal(email, em.GetString());
    }

    // ── LOGIN ────────────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var res = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "admin@test.com", password = "Admin@123" }));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("token", out var t));
        Assert.False(string.IsNullOrWhiteSpace(t.GetString()));
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var res = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "admin@test.com", password = "WrongPassword" }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Login_NonExistentEmail_Returns401()
    {
        var res = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "ghost@test.com", password = "Pass@1234" }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Login_AdminUser_ReturnsAdminRole()
    {
        var res  = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "admin@test.com", password = "Admin@123" }));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("role", out var r));
        Assert.Equal("Admin", r.GetString());
    }

    [Fact]
    public async Task Login_RegularUser_ReturnsUserRole()
    {
        var res  = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "user@test.com", password = "User@123" }));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("role", out var r));
        Assert.Equal("User", r.GetString());
    }

    [Fact]
    public async Task Login_Token_IsValidJwtFormat()
    {
        var res  = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "admin@test.com", password = "Admin@123" }));
        var body = await ReadJsonAsync(res);
        body.TryGetProperty("token", out var t);
        var parts = t.GetString()?.Split('.');
        Assert.Equal(3, parts?.Length);     // header.payload.signature
    }

    [Fact]
    public async Task Login_Response_ContainsExpiresAt()
    {
        var res  = await Client.PostAsync("/api/auth/login", MakeJson(new
        { email = "admin@test.com", password = "Admin@123" }));
        var body = await ReadJsonAsync(res);
        Assert.True(body.TryGetProperty("expiresAt", out var exp));
        var expDate = exp.GetDateTime();
        Assert.True(expDate > DateTime.UtcNow);
    }

    [Fact]
    public async Task Login_MissingBody_Returns400()
    {
        var res = await Client.PostAsync("/api/auth/login", MakeJson(new { }));
        Assert.True((int)res.StatusCode >= 400);
    }
    
}
