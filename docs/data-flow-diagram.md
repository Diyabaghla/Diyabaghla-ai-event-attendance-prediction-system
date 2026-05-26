# Data Flow Diagram — AI Event Attendance Prediction System

---

## 1. System Context

Data in this system flows across four layers: the Angular frontend, the ASP.NET Core API, the SQL Server database, and the FastAPI ML service. The backend is the single source of truth — the frontend never calls FastAPI directly. Every prediction request goes through the backend, which enriches it with database data before forwarding to the ML service.

---

## 2. Component Interaction Overview

```
┌─────────────┐     HTTP + JWT      ┌──────────────────┐     SQL      ┌──────────────┐
│   Angular   │ ─────────────────►  │  ASP.NET Core    │ ──────────►  │  SQL Server  │
│  Frontend   │ ◄─────────────────  │  Web API :5000   │ ◄──────────  │              │
└─────────────┘     JSON Response   └────────┬─────────┘              └──────────────┘
                                             │
                                    HTTP POST (JSON payload)
                                             │
                                    ┌────────▼─────────┐
                                    │  FastAPI ML      │
                                    │  Service :8000   │
                                    │  3 pkl models    │
                                    └──────────────────┘
```

---

## 3. Flow 1 — User Authentication

**Trigger:** User submits login or signup form.

```
┌──────────┐        ┌───────────────┐        ┌─────────────┐        ┌──────────────┐
│  Browser │        │    Angular    │        │  ASP.NET    │        │  SQL Server  │
└────┬─────┘        └──────┬────────┘        └──────┬──────┘        └──────┬───────┘
     │  Submit form        │                        │                       │
     │ ──────────────────► │                        │                       │
     │                     │  POST /api/auth/login  │                       │
     │                     │ ─────────────────────► │                       │
     │                     │  { email, password }    │                       │
     │                     │                        │  SELECT user WHERE    │
     │                     │                        │  email = ?            │
     │                     │                        │ ─────────────────────►│
     │                     │                        │  User record          │
     │                     │                        │ ◄─────────────────────│
     │                     │                        │  BCrypt.Verify()      │
     │                     │                        │  JWT.Generate()       │
     │                     │                        │  EmailService.Send()  │
     │                     │                        │  (async — non-blocking│
     │                     │                        │   login success email)│
     │                     │  { token, name, role } │                       │
     │                     │ ◄───────────────────── │                       │
     │                     │  Store token in        │                       │
     │                     │  localStorage          │                       │
     │  Redirect →         │                        │                       │
     │  /app/dashboard     │                        │                       │
     │ ◄─────────────────  │                        │                       │
```

**Data stored in Angular:**
```json
localStorage["token"] = "eyJhbGciOiJIUzI1NiJ9..."
localStorage["user"]  = { "fullName": "Diya", "email": "...", "role": "Admin" }
```

---

## 4. Flow 2 — Event Management (Admin creates an event)

**Trigger:** Admin fills in the Create Event form and submits.

```
┌──────────┐   ┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│  Admin   │   │    Angular    │   │  ASP.NET     │   │  SQL Server  │
└────┬─────┘   └──────┬────────┘   └──────┬───────┘   └──────┬───────┘
     │                │                   │                   │
     │ Submit form    │                   │                   │
     │ ─────────────► │                   │                   │
     │                │ POST /api/events  │                   │
     │                │ Bearer: <token>   │                   │
     │                │ ────────────────► │                   │
     │                │ { title, mode,    │                   │
     │                │   department,     │                   │
     │                │   capacity... }   │                   │
     │                │                  │ Validate JWT       │
     │                │                  │ Check role=Admin   │
     │                │                  │ INSERT INTO Events │
     │                │                  │ ─────────────────► │
     │                │                  │ Event { Id: 6 }   │
     │                │                  │ ◄───────────────── │
     │                │ 201 { id, title } │                   │
     │                │ ◄──────────────── │                   │
     │ Toast:         │                   │                   │
     │ "Event created"│                   │                   │
     │ Notification   │                   │                   │
     │ pushed to feed │                   │                   │
     │ ◄──────────── │                   │                   │
```

---

## 5. Flow 3 — Registration (with ended-event guard)

**Trigger:** User clicks "Register" on an event card.

```
┌──────────┐   ┌───────────────────────────┐   ┌──────────────┐   ┌──────────────┐
│   User   │   │          Angular          │   │  ASP.NET     │   │  SQL Server  │
└────┬─────┘   └─────────────┬─────────────┘   └──────┬───────┘   └──────┬───────┘
     │                       │                        │                   │
     │  Click Register       │                        │                   │
     │ ────────────────────► │                        │                   │
     │                       │ Guard: is event past?  │                   │
     │                       │ if yes → toast error   │                   │
     │                       │ return (no API call)   │                   │
     │                       │                        │                   │
     │                       │ POST /registrations    │                   │
     │                       │ { eventId, pastRate }  │                   │
     │                       │ ──────────────────────►│                   │
     │                       │                        │ EventDate < Now?  │
     │                       │                        │ → 400 Bad Request │
     │                       │                        │                   │
     │                       │                        │ Already registered│
     │                       │                        │ → 409 Conflict    │
     │                       │                        │                   │
     │                       │                        │ INSERT Registration
     │                       │                        │ ─────────────────►│
     │                       │                        │ { id, status }    │
     │                       │                        │ ◄─────────────────│
     │                       │  201 Created           │                   │
     │                       │ ◄──────────────────────│                   │
     │  Toast: "Registered!" │                        │                   │
     │ ◄──────────────────── │                        │                   │
```

---

## 6. Flow 4 — AI Attendance Prediction (Core AI Flow)

**Trigger:** User or Admin selects an event on the Attendance Prediction page and clicks "Predict".

```
┌──────────┐  ┌───────────┐  ┌──────────────────────────┐  ┌──────────┐  ┌─────────────┐
│   User   │  │  Angular  │  │       ASP.NET Core        │  │ SQL Svr  │  │   FastAPI   │
└────┬─────┘  └─────┬─────┘  └─────────────┬────────────┘  └────┬─────┘  └──────┬──────┘
     │              │                       │                    │               │
     │ Click Predict│                       │                    │               │
     │ ───────────► │                       │                    │               │
     │              │ GET /predictions/     │                    │               │
     │              │ attendance/{eventId}  │                    │               │
     │              │ ─────────────────────►│                    │               │
     │              │                       │ SELECT Event + reg │               │
     │              │                       │ count WHERE id=?   │               │
     │              │                       │ ──────────────────►│               │
     │              │                       │ Event data + count │               │
     │              │                       │ ◄──────────────────│               │
     │              │                       │                    │               │
     │              │                       │ Build 12-feature   │               │
     │              │                       │ JSON payload       │               │
     │              │                       │                    │               │
     │              │                       │ POST /predict-     │               │
     │              │                       │ attendance         │               │
     │              │                       │ ──────────────────────────────────►│
     │              │                       │                    │  OneHotEncode │
     │              │                       │                    │  RF.predict() │
     │              │                       │ { predicted_att }  │               │
     │              │                       │ ◄──────────────────────────────────│
     │              │                       │                    │               │
     │              │                       │ Cap: predicted ≤   │               │
     │              │                       │ activeRegistrations│               │
     │              │ { predictedAtt,       │                    │               │
     │              │   activeRegistrations}│                    │               │
     │              │ ◄─────────────────────│                    │               │
     │ Display gauge│                       │                    │               │
     │ factor cards │                       │                    │               │
     │ ◄──────────  │                       │                    │               │
```

---

## 7. Flow 5 — No-Show Prediction

**Trigger:** User selects an event on the No-Show Prediction page and clicks "Predict".

```
Angular → GET /api/predictions/no-show/{eventId}
        → ASP.NET fetches event from SQL Server
        → Builds 7-feature payload:
          { event_type, mode, department, day_of_week,
            past_user_attendance_rate, days_before_registration,
            reminder_sent }
        → POST /predict-no-show to FastAPI
        → FastAPI RandomForestClassifier returns:
          { prediction: "Attend" | "Not Attend", probability: 0.88 }
        → Angular displays:
          - Probability ring canvas
          - Risk level badge
          - Factor radar chart
          - Recommendations panel
```

---

## 8. Flow 6 — User Attendance Prediction

**Trigger:** User selects an event on the User Attendance page and clicks "Predict".

```
Angular → GET /api/predictions/user-attendance/{eventId}
        → ASP.NET fetches event + current user's registration data
        → Builds 7-feature payload (same structure as no-show)
        → POST /predict-user-attendance to FastAPI
        → FastAPI RandomForestClassifier returns:
          { probability: 0.93, prediction: "Attend" }
        → Angular displays:
          - Segmented probability ring
          - Horizontal gauge bar
          - Trend line chart (simulated history + current score)
          - Factor breakdown table
          - Improvement tips
```

---

## 9. Flow 7 — Resource Planning (Derived from Prediction)

**Trigger:** User selects an event in Resource Planning and clicks "Calculate Resources".

```
Angular Resource Planning Component
    │
    ▼  (AI mode) GET /api/predictions/attendance/{eventId}
    │  (Manual mode) uses manualAttendance input directly
    │
    ▼  Returns: { predictedAttendance: 387, activeRegistrations: 312 }
    │
    ▼  Angular applies resource formulas locally:

    a = 387  (predicted attendance)
    buf = 1.08  (8% safety buffer, configurable)

    chairs        = ceil(a × buf)     = 418
    extra_chairs  = ceil(a × 0.05)    = 20
    tables        = ceil(a / 6)       = 65
    meals         = ceil(a × buf)     = 418
    snacks        = ceil(a × 1.15)    = 445
    water_bottles = ceil(a × 2.5)     = 968
    staff         = max(4, ceil(a/25)) = 16
    reg_desk      = max(2, ceil(a/80)) = 5
    security      = max(2, ceil(a/100))= 4
    tech_support  = max(1, ceil(a/150))= 3
    projectors    = max(1, ceil(a/200))= 2
    microphones   = max(2, ceil(a/100))= 4

    ▼  Animated counters count up from 0
    ▼  UI displays results in 4 tabbed category cards:
       Seating | Catering | Staff | Equipment
    ▼  Donut chart shows proportional distribution
```

---

## 10. Flow 8 — Reports & Analytics (Admin)

**Trigger:** Admin navigates to the Reports page.

```
Angular Reports Component
    │
    ▼  forkJoin with catchError on each call (parallel, non-blocking):
       GET /api/reports/attendance-vs-registration
       GET /api/reports/cancelled-vs-registered
       GET /api/reports/event-performance
       GET /api/reports/department-breakdown       ← new
       GET /api/reports/weekly-trend               ← new
       GET /api/reports/top-stats                  ← new
    │
    ▼  ASP.NET ReportService aggregates from SQL Server:
       - COUNT registrations grouped by status
       - JOIN Events to get capacity and speaker rating
       - Fill rate: (activeRegistrations / locationCapacity) × 100
       - Department breakdown: GROUP BY department, mode, eventType
       - Weekly trend: GROUP BY week start date (last 8 weeks)
    │
    ▼  Returns 6 JSON payloads
    │
    ▼  ChangeDetectorRef.detectChanges() → requestAnimationFrame()
    ▼  Canvas API draws 6 charts:
       - Bar chart: registrations vs AI predicted per event
       - Donut chart: registered vs cancelled ratio
       - Line chart: fill rate trend across events
       - Horizontal bar: registrations by department  ← new
       - Pie chart: event mode split                  ← new
       - Stacked bar: weekly registration trend       ← new
    │
    ▼  Admin can download reports via CSV endpoints:
       GET /api/reports/download/event-performance-csv
       GET /api/reports/download/registrations-csv
       GET /api/reports/download/department-csv
       or export full report as JSON (client-side)
```

---

## 11. Flow 9 — Email Notifications (Background)

**Trigger:** Automatic — `ReminderBackgroundService` runs hourly on the backend.

```
ASP.NET ReminderBackgroundService (IHostedService)
    │
    ▼  Every 1 hour:
       SELECT Events WHERE EventDate BETWEEN now AND now+2days
       JOIN Registrations WHERE Status = 'Registered'
    │
    ▼  For each registration found:
       EmailService.SendEventReminderAsync(
         toEmail, userName, eventTitle, eventDate, ...
       )
    │
    ▼  SMTP sends HTML email to registered user
    │
    ▼  On login success:
       EmailService.SendLoginSuccessAsync(email, name, time, ip)
       ← fire-and-forget, wrapped in try/catch
       ← email failure never breaks the login response
    │
    ▼  On registration confirmation:
       EmailService.SendRegistrationConfirmAsync(
         email, userName, event object, registrationDate
       )
```

---

## 12. Data Transformation Pipeline (ML Models)

The following shows how raw event data becomes a prediction:

```
SQL Server (raw event record)
│
│  title: "AI Summit"       ← not used by ML
│  eventType: "Conference"  ─┐
│  mode: "Online"            ├─ OneHotEncoded
│  department: "Engineering" ┘  (creates binary columns per category)
│  registrations: 480        ─┐
│  is_weekend: 0              │
│  durationHours: 4.0         │
│  speakerRating: 4.5         ├─ Numerical (passthrough)
│  reminderSent: true (→ 1)  │
│  pastAttendanceRate: 0.78   │
│  ticketPrice: 0.0           │
│  locationCapacity: 500      ┘
│
▼  Pipeline: ColumnTransformer → RandomForestRegressor / Classifier
│
▼  Attendance output:   387  (regression — continuous)
   No-Show output:      { "Attend", 0.88 }  (classification)
   User Attend output:  { "Attend", 0.93 }  (classification)
│
▼  Backend caps attendance prediction:
   if predictedAttendance > activeRegistrations:
       predictedAttendance = activeRegistrations
```

**Categorical encoding example:**

```
eventType = "Conference" → [1, 0, 0, 0, 0, 0, 0, 0, 0]
                              ^Conference
                                ^Workshop
                                  ^Seminar ... etc
```

---

## 13. Error Handling Flow

```
Any API call
    │
    ▼  ASP.NET ExceptionMiddleware catches unhandled exceptions
    │
    ▼  Returns structured JSON:
       {
         "statusCode": 500,
         "message": "An internal error occurred."
       }
    │
    ▼  Angular AuthInterceptor:
       - 401 → logout() + redirect to /login
       - 4xx/5xx → propagate error to component
    │
    ▼  Component error handler:
       - Sets error message in template
       - Never leaves user on infinite loading spinner
       - Shows "Retry" button for recoverable failures
    │
    ▼  Report page uses catchError per observable:
       forkJoin({
         att:   getAttendance().pipe(catchError(() => of([]))),
         stats: getTopStats().pipe(catchError(() => of(null))),
         ...
       })
       ← individual endpoint failures do not break the whole page
```
