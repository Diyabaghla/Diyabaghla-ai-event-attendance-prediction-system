using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using EventPredictionAPI.Data;
using EventPredictionAPI.Middleware;
using EventPredictionAPI.Services;
 
var builder = WebApplication.CreateBuilder(args);
 
// ─────────────────────────────────────────────
// Database
// ─────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
 
// ─────────────────────────────────────────────
// JWT Authentication
// ─────────────────────────────────────────────
// Console.WriteLine("ENV: " + builder.Environment.EnvironmentName);
// Console.WriteLine("JWT KEY: " + builder.Configuration["Jwt:Key"]);
 
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is not configured.");

 
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
 
builder.Services.AddAuthorization();
 
// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
 
// ─────────────────────────────────────────────
// HttpClient for FastAPI
// ─────────────────────────────────────────────
builder.Services.AddHttpClient("FastAPI", client =>
{
    var baseUrl = builder.Configuration["FastAPI:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout     = TimeSpan.FromSeconds(30);
});
 
// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────
builder.Services.AddScoped<IAuthService,         AuthService>();
builder.Services.AddScoped<IEventService,        EventService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
builder.Services.AddScoped<IPredictionService,   PredictionService>();
builder.Services.AddScoped<IReportService,       ReportService>();
 
// ── EMAIL SERVICE ─────────────────────────────────────────────
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();
 
// ── REMINDER BACKGROUND SERVICE ───────────────────────────────
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddHostedService<ReminderBackgroundService>();
}
 
// ─────────────────────────────────────────────
// Controllers + Swagger
// ─────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "AI Event Attendance Prediction API",
        Version     = "v1",
        Description = "ASP.NET Core backend for event management, registration, and ML-powered attendance prediction."
    });
 
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name        = "Authorization",
        Type        = SecuritySchemeType.Http,
        Scheme      = "Bearer",
        BearerFormat = "JWT",
        In          = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });
 
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
 
// ─────────────────────────────────────────────
// Build & Middleware Pipeline
// ─────────────────────────────────────────────
var app = builder.Build();
 
// ── DATABASE STARTUP ──────────────────────────────────────────
// Uses Migrate() for SQL Server (production/dev)
// Uses EnsureCreated() for SQLite (integration tests)
// This prevents "table already exists" errors during testing
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 
//    var env = app.Environment.EnvironmentName;
// if (env == "Testing" || db.Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
//     db.Database.EnsureCreated();
// else
//     db.Database.Migrate();       // production/dev — run migrations normally
// }
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
 
app.UseMiddleware<ExceptionMiddleware>();
 
app.UseSwagger();
app.UseSwaggerUI();
 
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
 
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
 
app.Run();
 
public partial class Program { }