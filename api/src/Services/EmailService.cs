using System.Net;
using System.Net.Mail;
using EventPredictionAPI.Models;
using Microsoft.Extensions.Options;

namespace EventPredictionAPI.Services;

// ── Config model ──────────────────────────────────────────────
public class EmailSettings
{
    public string FromEmail    { get; set; } = "";
    public string FromName     { get; set; } = "";
    public string SmtpHost     { get; set; } = "";
    public int    SmtpPort     { get; set; } = 587;
    public string Username     { get; set; } = "";
    public string AppPassword  { get; set; } = "";
}

// ── Interface ─────────────────────────────────────────────────
public interface IEmailService
{
    Task SendLoginSuccessAsync(string toEmail, string fullName, string loginTime, string ipAddress);
    Task SendRegistrationConfirmAsync(string toEmail, string fullName, Event ev, DateTime registeredAt);
    Task SendEventReminderAsync(string toEmail, string fullName, Event ev);
}

// ── Implementation ────────────────────────────────────────────
public class EmailService : IEmailService
{
    private readonly EmailSettings _cfg;
    private readonly ILogger<EmailService> _log;

    public EmailService(IOptions<EmailSettings> cfg, ILogger<EmailService> log)
    {
        _cfg = cfg.Value;
        _log = log;
    }

    // ── 1. Login success email ────────────────────────────────
    public async Task SendLoginSuccessAsync(
        string toEmail, string fullName,
        string loginTime, string ipAddress)
    {
        var subject = "✅ Login Successful — EventAI";
        var body    = LoginEmailTemplate(fullName, loginTime, ipAddress, toEmail);
        await SendAsync(toEmail, fullName, subject, body);
    }

    // ── 2. Registration confirmation email ───────────────────
    public async Task SendRegistrationConfirmAsync(
        string toEmail, string fullName,
        Event ev, DateTime registeredAt)
    {
        var subject = $"🎫 Registration Confirmed — {ev.Title}";
        var body    = RegistrationEmailTemplate(fullName, ev, registeredAt);
        await SendAsync(toEmail, fullName, subject, body);
    }

    // ── 3. One-day reminder email ────────────────────────────
    public async Task SendEventReminderAsync(
        string toEmail, string fullName, Event ev)
    {
        var subject = $"⏰ Reminder: \"{ev.Title}\" is Tomorrow!";
        var body    = ReminderEmailTemplate(fullName, ev);
        await SendAsync(toEmail, fullName, subject, body);
    }

    // ── Core SMTP sender ─────────────────────────────────────
    private async Task SendAsync(
        string toEmail, string toName,
        string subject, string htmlBody)
    {
        try
        {
            using var client = new SmtpClient(_cfg.SmtpHost, _cfg.SmtpPort)
            {
                EnableSsl        = true,
                Credentials      = new NetworkCredential(_cfg.Username, _cfg.AppPassword),
                DeliveryMethod   = SmtpDeliveryMethod.Network,
                Timeout          = 10_000
            };

            using var msg = new MailMessage
            {
                From       = new MailAddress(_cfg.FromEmail, _cfg.FromName),
                Subject    = subject,
                Body       = htmlBody,
                IsBodyHtml = true
            };
            msg.To.Add(new MailAddress(toEmail, toName));
            msg.ReplyToList.Add(new MailAddress(_cfg.FromEmail));

            await client.SendMailAsync(msg);
            _log.LogInformation("Email sent to {Email} — {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            // Log but don't crash the app if email fails
            _log.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    // ════════════════════════════════════════════════════════
    // EMAIL TEMPLATES
    // ════════════════════════════════════════════════════════

    private static string BaseTemplate(string content) => $@"
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:#f0f4f8; font-family:'Segoe UI',Arial,sans-serif; }}
  .wrapper {{ max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }}
  .header {{ background:linear-gradient(135deg,#0b1120 0%,#1a2540 100%); padding:36px 40px 28px; text-align:center; }}
  .logo {{ display:inline-flex; align-items:center; gap:10px; text-decoration:none; }}
  .logo-icon {{ width:40px;height:40px; background:linear-gradient(135deg,#00a8a8,#006666); border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:22px; }}
  .logo-text {{ color:#fff; font-size:22px; font-weight:800; letter-spacing:-0.5px; }}
  .logo-text span {{ color:#00c5c5; }}
  .body {{ padding:40px; }}
  .greeting {{ font-size:22px; font-weight:700; color:#111827; margin-bottom:8px; }}
  .sub {{ font-size:15px; color:#6b7280; margin-bottom:28px; line-height:1.6; }}
  .card {{ background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:24px; margin:20px 0; }}
  .card-title {{ font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:14px; }}
  .detail-row {{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f3f4f6; }}
  .detail-row:last-child {{ border-bottom:none; }}
  .detail-label {{ font-size:13px; color:#6b7280; }}
  .detail-value {{ font-size:13px; font-weight:600; color:#111827; }}
  .badge {{ display:inline-block; padding:3px 10px; border-radius:99px; font-size:12px; font-weight:600; }}
  .badge-teal {{ background:#ccfbf1; color:#0d9488; }}
  .badge-amber {{ background:#fef3c7; color:#d97706; }}
  .badge-rose {{ background:#fee2e2; color:#dc2626; }}
  .btn {{ display:inline-block; padding:13px 28px; background:linear-gradient(135deg,#00a8a8,#006666); color:#fff!important; border-radius:10px; text-decoration:none; font-size:15px; font-weight:600; margin:20px 0; }}
  .divider {{ height:1px; background:#f3f4f6; margin:24px 0; }}
  .footer {{ background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #f3f4f6; }}
  .footer p {{ font-size:12px; color:#9ca3af; line-height:1.6; }}
  .footer a {{ color:#00a8a8; text-decoration:none; }}
  .highlight {{ color:#00a8a8; font-weight:600; }}
</style>
</head>
<body>
<div class='wrapper'>
  <div class='header'>
    <div class='logo'>
      <div class='logo-icon'>⬡</div>
      <span class='logo-text'>Event<span>AI</span></span>
    </div>
  </div>
  <div class='body'>
    {content}
  </div>
  <div class='footer'>
    <p>This email was sent by <a href='#'>EventAI</a> · AI-powered Event Attendance Prediction</p>
    <p style='margin-top:6px'>If you did not perform this action, please contact support immediately.</p>
  </div>
</div>
</body>
</html>";

    // ── Login template ────────────────────────────────────────
    private static string LoginEmailTemplate(
        string name, string loginTime, string ip, string email) =>
        BaseTemplate($@"
<div class='greeting'>Welcome back, {name}! 👋</div>
<p class='sub'>You have successfully signed in to your EventAI account.</p>

<div class='card'>
  <div class='card-title'>Login Details</div>
  <div class='detail-row'>
    <span class='detail-label'>Account</span>
    <span class='detail-value highlight'>{email}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Date &amp; Time</span>
    <span class='detail-value'>{loginTime}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>IP Address</span>
    <span class='detail-value'>{ip}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Status</span>
    <span class='badge badge-teal'>✓ Successful</span>
  </div>
</div>

<p style='font-size:14px;color:#6b7280;line-height:1.7'>
  If this wasn't you, please change your password immediately and contact our support team.
</p>

<div class='divider'></div>
<a href='http://localhost:4200/app/dashboard' class='btn'>Go to Dashboard →</a>
");

    // ── Registration template ─────────────────────────────────
    private static string RegistrationEmailTemplate(
        string name, Event ev, DateTime registeredAt)
    {
        var modeColor = ev.Mode switch
        {
            "Online"  => "badge-teal",
            "Offline" => "badge-amber",
            _         => "badge-teal"
        };
        var price = ev.TicketPrice == 0 ? "Free" : $"${ev.TicketPrice}";
        return BaseTemplate($@"
<div class='greeting'>Registration Confirmed! 🎫</div>
<p class='sub'>Hi <strong>{name}</strong>, your spot has been secured for the following event.</p>

<div class='card'>
  <div class='card-title'>Event Details</div>
  <div class='detail-row'>
    <span class='detail-label'>Event Name</span>
    <span class='detail-value highlight'>{ev.Title}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Type</span>
    <span class='detail-value'>{ev.EventType}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Mode</span>
    <span class='badge {modeColor}'>{ev.Mode}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Department</span>
    <span class='detail-value'>{ev.Department}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Date &amp; Time</span>
    <span class='detail-value'>{ev.EventDate:dddd, MMMM dd, yyyy · h:mm tt}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Duration</span>
    <span class='detail-value'>{ev.DurationHours} hours</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Ticket Price</span>
    <span class='detail-value'>{price}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Registered At</span>
    <span class='detail-value'>{registeredAt:MMM dd, yyyy · h:mm tt}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Status</span>
    <span class='badge badge-teal'>✓ Confirmed</span>
  </div>
</div>

<p style='font-size:14px;color:#6b7280;line-height:1.7'>
  We'll send you a reminder <strong>1 day before</strong> the event. Make sure to check your email!
</p>
<div class='divider'></div>
<a href='http://localhost:4200/app/registrations' class='btn'>View My Registrations →</a>
");
    }

    // ── Reminder template ─────────────────────────────────────
    private static string ReminderEmailTemplate(string name, Event ev) =>
        BaseTemplate($@"
<div class='greeting'>Your event is tomorrow! ⏰</div>
<p class='sub'>Hi <strong>{name}</strong>, this is a friendly reminder that you're registered for an event happening <strong>tomorrow</strong>.</p>

<div class='card'>
  <div class='card-title'>Tomorrow's Event</div>
  <div class='detail-row'>
    <span class='detail-label'>Event</span>
    <span class='detail-value highlight'>{ev.Title}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Date</span>
    <span class='detail-value'>{ev.EventDate:dddd, MMMM dd, yyyy}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Time</span>
    <span class='detail-value'>{ev.EventDate:h:mm tt}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Mode</span>
    <span class='detail-value'>{ev.Mode}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Department</span>
    <span class='detail-value'>{ev.Department}</span>
  </div>
  <div class='detail-row'>
    <span class='detail-label'>Duration</span>
    <span class='detail-value'>{ev.DurationHours} hours</span>
  </div>
</div>

<p style='font-size:14px;color:#6b7280;line-height:1.7'>
  Please make sure you're prepared and on time. We look forward to seeing you there! 🎉
</p>
<div class='divider'></div>
<a href='http://localhost:4200/app/registrations' class='btn'>View Registration Details →</a>
");
}
