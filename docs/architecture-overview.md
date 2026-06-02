# Architecture Overview — AI Event Attendance Prediction System

## 1. System Summary

**EventAI** is a three-tier, AI-powered event management platform. It predicts event attendance using machine learning, detects likely no-shows, auto-generates resource plans, and provides real-time analytics — all through a modern web interface secured by role-based JWT authentication.

New in this version:
- **Standalone Angular components** 
- **In-app notification system** with bell icon, real-time polling, and per-user localStorage namespacing
- **Transactional email system** (Gmail SMTP) for login alerts, registration confirmations, and 1-day event reminders

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│                                                                      │
│   User / Admin  ──►  Angular 21 SPA  (http://localhost:4200)         │
│                       Standalone Components · TypeScript · SCSS      │
│                       Canvas API · Signals · BehaviorSubject         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  HTTP REST + JWT Bearer Token
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                         API LAYER                                    │
│                                                                      │
│           ASP.NET Core 9 Web API  (http://localhost:5000)            │
│           C# · Entity Framework Core · BCrypt · JWT                  │
│                                                                      │
│   ┌──────────┐ ┌──────────┐ ┌───────────────┐ ┌──────────────────┐   │
│   │   Auth   │ │  Events  │ │ Registrations │ │    Reports       │   │
│   │Controller│ │Controller│ │  Controller   │ │   Controller     │   │
│   └──────────┘ └──────────┘ └───────────────┘ └──────────────────┘   │
│         ┌───────────────────────────────────────────────────────┐    │
│         │  PredictionsController  (proxy to FastAPI)            │    │
│         └───────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  Email System (Gmail SMTP)                                   │   │
│   │  EmailService · ReminderBackgroundService                    │   │  
│   │  Triggers: Login · Registration · 1-day event reminder       │   │
│   └──────────────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────┬─────────────────────┘
                 │                              │
        SQL queries via EF Core          HTTP POST (JSON)
                 │                              │
┌────────────────▼────────────┐    ┌───────────▼──────────────────────┐
│        DATA LAYER            │    │       ML SERVICE LAYER            │
│                              │    │                                   │
│       SQL Server             │    │  FastAPI  (http://localhost:8000) │
│                              │    │  Python · scikit-learn · joblib   │
│  ┌────────┐ ┌────────────┐  │    │                                   │
│  │ Users  │ │   Events   │  │    │  ┌──────────────────────────────┐ │
│  └────────┘ └────────────┘  │    │  │ attendance_prediction.pkl    │ │
│  ┌──────────────────────┐   │    │  │ no_show_prediction.pkl       │ │
│  │    Registrations     │   │    │  │ user_attendance.pkl          │ │
│  └──────────────────────┘   │    │  └──────────────────────────────┘ │
└─────────────────────────────┘    └───────────────────────────────────┘
```

---

## 3. Layer Descriptions

### 3.1 Angular Frontend (ui/)

The frontend is a **Single Page Application** built with Angular 21 using **standalone components** — no NgModule declarations. Every component is self-contained with its own `imports` array.

**Responsibilities:**
- Render all pages using standalone components: Landing, Login, Signup, Dashboard, Events, Registrations, Predictions, Resource Planning, Reports
- Store and manage the JWT token in `localStorage`
- Auto-attach the Bearer token to every API request via `AuthInterceptor`
- Guard protected routes via `AuthGuard` — redirects unauthenticated users to `/login`
- Display global toast notifications (success, error, info) via `ToastService`
- Draw charts using the native HTML5 Canvas API (no external chart libraries)
- Show real-time in-app notifications via `NotificationService` with bell icon
- Send/receive per-user notification state isolated in `localStorage` using JWT sub claim

**Key services:**

| File | Responsibility |
|---|---|
| `auth.service.ts` | JWT storage, token expiry check, user BehaviorSubject |
| `api.services.ts` | All HTTP calls to the ASP.NET API |
| `toast.service.ts` | Global toast notification stream (BehaviorSubject) |
| `notification.service.ts` | In-app notification signal, polling, per-user storage |
| `auth.guard.ts` | Route protection |
| `auth.interceptor.ts` | Auto-attach Bearer token, handle 401 auto-logout |





---

### 3.2 Notification System (Frontend)

The notification system is fully client-side with a backend fallback polling strategy.

```
Shell loads (user logged in)
    │
    ▼  notifSvc.startPolling()
    │
    ├── loadFromStorage()          ← loads THIS user's notifications from localStorage
    │
    ├── GET /api/notifications     ← tries backend endpoint
    │       │
    │       ├── success → merge new server notifications
    │       └── error  → fallback: GET /api/events
    │                        │
    │                        └── generate client-side reminders:
    │                              diffDays=2 → reminder_2days
    │                              diffDays=1 → reminder_1day
    │                              diffDays=0 → reminder_today
    │
    └── repeat every 60 seconds
```



**Notification types:**

| Type | Icon | Trigger |
|---|---|---|
| `event_added` | 📅 | Admin creates a new event |
| `registration_success` | 🎫 | User registers for an event |
| `reminder_2days` | ⏰ | 2 days before a registered event |
| `reminder_1day` | ⚡ | 1 day before a registered event |
| `reminder_today` | 🎉 | Day of a registered event |
| `event_cancelled` | ❌ | Event is cancelled |
| `general` | 🔔 | General system notification |

---

### 3.3 Email System (Backend)

Transactional emails are sent via **Gmail SMTP** using .NET's `SmtpClient`. All emails are fire-and-forget (`Task.Run`) so they never block API responses.

**Configuration (`appsettings.json`):**
```json
"EmailSettings": {
  "FromEmail":   "your-gmail@gmail.com",
  "FromName":    "EventAI Platform",
  "SmtpHost":    "smtp.gmail.com",
  "SmtpPort":    587,
  "Username":    "your-gmail@gmail.com",
  "AppPassword": "xxxx xxxx xxxx xxxx"
}
```

**Email triggers:**

| Email | When sent | Service |
|---|---|---|
| ✅ Login Success | Every successful login | `AuthController.Login()` |
| 🎫 Registration Confirmed | User registers for an event | `RegistrationsController.Register()` |
| ⏰ Event Reminder | 1 day before event (automatic) | `ReminderBackgroundService` |

**`ReminderBackgroundService`:**
- Runs as a hosted background service (`IHostedService`)
- Checks every hour for events happening tomorrow
- Sends reminder emails to all active registrants
- Tracks sent reminders in-memory to prevent duplicates

```
App startup → ReminderBackgroundService.ExecuteAsync()
    │
    └── every 1 hour:
          query Events WHERE EventDate = tomorrow
          for each active Registration:
              if not already sent:
                  EmailService.SendEventReminderAsync()
```

---

### 3.4 ASP.NET Core Backend (api/src/)

The backend is a **REST API** built with ASP.NET Core 9 following a layered architecture:

```
Controllers  →  Services  →  Entity Framework Core  →  SQL Server
```

**Responsibilities:**
- Issue and validate JWT tokens for authentication
- Enforce role-based access control (User / Admin)
- Provide CRUD operations for Events and Registrations
- Act as a **prediction proxy** — fetch event data from DB, build feature payload, forward to FastAPI
- Aggregate reports and analytics from registration data
- Send transactional emails via `EmailService`
- Run `ReminderBackgroundService` in the background

**Controllers:**

| Controller | Responsibility |
|---|---|
| `AuthController` | Signup (BCrypt hash + JWT), Login + login email |
| `EventsController` | Full CRUD — GET (User), Write (Admin only) |
| `RegistrationsController` | Register, Cancel, List + registration confirmation email |
| `PredictionsController` | Proxy to FastAPI with DB-enriched features + cap logic |
| `ReportsController` | 6 endpoints: attendance, status, performance, top stats, departments, weekly trend + 3 CSV downloads |





### 3.5 FastAPI ML Service (tools/)

The ML service is a **standalone Python microservice** that loads three pre-trained machine learning models at startup and serves prediction endpoints.


**Models:**

| Model | Algorithm | Target | Score |
|---|---|---|---|
| `attendance_prediction_model.pkl` | RandomForestRegressor | Predicted attendee count | R² = 0.99 |
| `no_show_prediction_model.pkl` | RandomForestClassifier | Attend / Not Attend | Accuracy = 97% |
| `user_attendance_model.pkl` | RandomForestClassifier | Attendance probability (0–1) | Accuracy = 74% |



### 3.6 SQL Server Database

Managed via **EF Core Code-First** with migrations.

**Tables:**

```
Users               Events                  Registrations
────────────        ──────────────────      ──────────────────────
Id (PK)             Id (PK)                 Id (PK)
FullName            Title                   UserId (FK → Users)
Email (Unique)      Description             EventId (FK → Events)
PasswordHash        EventType               RegistrationDate
Role                Mode                    Status (Registered/Cancelled)
CreatedAt           Department              DaysBeforeRegistration
                    EventDate               PastUserAttendanceRate
                    DayOfWeek
                    DurationHours
                    SpeakerRating
                    ReminderSent
                    PastAttendanceRate
                    Weather
                    TicketPrice
                    LocationCapacity
                    CreatedAt
```

---

## 4. Communication Flow

### 4.1 Standard API Request

```
Angular Component
    │
    ▼  HTTP GET/POST (JSON)
AuthInterceptor → adds: Authorization: Bearer <jwt_token>
    │
    ▼
ASP.NET Core API → validates JWT signature + expiry
    │
    ▼  EF Core query
SQL Server → returns data
    │
    ▼  JSON response
Angular Component → updates UI
```

### 4.2 AI Prediction Request

```
Angular Prediction Page
    │
    ▼  GET /api/predictions/attendance/{eventId}
ASP.NET PredictionService
    │  queries SQL Server for event + registration count
    │  builds 9-feature JSON payload
    ▼  POST http://localhost:8000/predict-attendance
FastAPI ML Service
    │  OneHotEncodes: eventType, mode, department, dayOfWeek
    │  RandomForest.predict()
    ▼  { "predictedAttendance": 387 }
ASP.NET → applies cap: min(predicted, activeRegistrations)
    │
    ▼  returns capped result to Angular
Angular → displays result + drives resource planning
```

### 4.3 Authentication + Email Flow

```
User submits login form
    │
    ▼  POST /api/auth/login { email, password }
ASP.NET AuthService
    │  BCrypt.Verify(password, storedHash)
    │  JWT.Generate({ userId, email, role, exp: now+24h })
    ├──► Task.Run → EmailService.SendLoginSuccessAsync()  (fire & forget)
    ▼  { token, fullName, email, role }
Angular AuthService
    │  localStorage.setItem("token", jwt)
    │  BehaviorSubject.next(user)
    ▼  Router.navigate("/app/dashboard")
Shell.ngOnInit()
    └──► NotificationService.startPolling()
```

### 4.4 Registration + Email + Notification Flow

```
User clicks Register
    │
    ▼  POST /api/registrations { eventId, pastUserAttendanceRate }
ASP.NET RegistrationsController
    │  creates Registration record in DB
    ├──► Task.Run → EmailService.SendRegistrationConfirmAsync()  (fire & forget)
    ▼  201 Created
Angular RegistrationsComponent
    ├──► ToastService.success("Registered!")
    └──► NotificationService.push('registration_success', ...)
```

### 4.5 Automatic Email Reminder Flow

```
ReminderBackgroundService (runs every hour)
    │
    ▼  query Events WHERE EventDate = tomorrow
    │
    for each Event:
        for each active Registration:
            if reminder not already sent:
                ▼  EmailService.SendEventReminderAsync(user.Email, ev)
                    → Gmail SMTP → user's inbox
```

---

## 5. Security

| Mechanism | Implementation |
|---|---|
| Password hashing | BCrypt with adaptive work factor |
| Authentication | JWT HS256, 24-hour expiry |
| Authorization | `[Authorize(Roles="Admin")]` on write endpoints |
| Token transmission | `Authorization: Bearer <token>` header |
| Token expiry check | Angular reads JWT payload, auto-logout if expired |
| 401 handling | `AuthInterceptor` catches 401 → `auth.logout()` |
| Email security | Gmail App Password (not account password), TLS port 587 |

---

## 6. Role Permissions

| Feature | User | Admin |
|---|---|---|
| View all events | ✅ | ✅ |
| Create / Edit / Delete events | ❌ | ✅ |
| Register for event | ✅ | ✅ |
| Cancel own registration | ✅ | ✅ |
| View own registrations | ✅ | ✅ |
| View all registrations | ❌ | ✅ |
| Run AI predictions | ✅ | ✅ |
| View reports & analytics | ❌ | ✅ |
| Receive login emails | ✅ | ✅ |
| Receive registration emails | ✅ | ✅ |
| Receive event reminder emails | ✅ | ✅ |
| View in-app notifications | ✅ | ✅ |

---

## 7. 📁 Complete Directory Structure

```
Diya-ai-event-attendance-prediction/
│
├── docs/
│   ├── architecture-overview.md
│   ├── api-contracts.md
│   └── assumptions.md
    └── data-flow-diagram.md
│
├── 📂 api/                                    # Backend (.NET Core 9)
│   └── 📂 src/
        ├── Program.cs
│       ├── appsettings.json
        ├── appsettings.Development.json
        ├── appsettings.Testing.json
│       └── EventPredictionAPI.csproj
│       ├── 📂 Controllers/
│       │   ├── AuthController.cs
│       │   ├── EventsController.cs
│       │   ├── RegistrationsController.cs
│       │   ├── PredictionsController.cs
│       │   └── ReportsController.cs
│       │
│       ├── 📂 Models/
│       │   └── Models.cs
│       │
│       ├── 📂 DTOs/
│       │   └── DTOs.cs
│       │
│       ├── 📂 Data/
│       │   └── AppDbContext.cs
│       │
│       ├── 📂 Services/
│       │   ├── AuthService.cs
│       │   ├── EventService.cs
│       │   ├── RegistrationService.cs
│       │   ├── PredictionService.cs
│       │   ├── ReportService.cs
│       │   ├── EmailService.cs                 
│       │   └── ReminderBackgroundService.cs    
│       │
│       ├── 📂 Middleware/
│       │   └── ExceptionMiddleware.cs
│       │
│       ├── 📂 Migrations/
             └── 20260411140529_InitialCreate.cs
             └── 20260411140529_InitialCreate.Designer.cs
             └── AppDbContextModelSnapshot.cs
│   
│
├── 📂 api/tests/
     └── 📂 integration/     # Integration tests
     │    ├── IntegrationTestBase.cs
     │    ├── AuthIntegrationTests.cs
     │    ├── EventsIntegrationTests.cs
     │    ├── RegistrationsIntegrationTests.cs
     │    ├── IntegrationTests.csproj
     │    └── ReportsIntegrationTests.cs
     │ 
     └── 📂 unit-tests/                  #Service tests 
          ├── AuthServiceTests.cs
│         ├── EventServiceTests.cs
│         ├── MSTestSettings.cs
│         ├── PredictionServiceTests.cs
│         └── RegistrationsServiceTests.cs
│
├── 📂 ui/                                     # Frontend (Angular 21)
│   └── 📂 src/app/
│       ├── app.config.ts                      # provideRouter, provideHttpClient
│       ├── app.routes.ts
│       │
│       ├── 📂 models/
│       │   └── models.ts
│       │
│       ├── 📂 services/
│       │   ├── auth.service.ts
│       │   ├── api.services.ts
│       │   ├── toast.service.ts
│       │   └── notification.service.ts       
│       │
│       ├── 📂 guards/
│       │   └── auth.guard.ts
│       │
│       ├── 📂 interceptors/
│       │   └── auth.interceptor.ts
│       │
│       └── 📂 components/
│           ├── 📂 landing/
│           ├── 📂 auth/
│           │   ├── 📂 login/
│           │   └── 📂 signup/
│           ├── 📂 dashboard/
│           ├── 📂 events/
│           ├── 📂 registrations/
│           ├── 📂 predictions/
│           │   ├── 📂 attendance-prediction/
│           │   ├── 📂 no-show-prediction/
│           │   └── 📂 user-attendance-prediction/
│           ├── 📂 resource-planning/
│           ├── 📂 reports/
│           └── 📂 shared/
│               ├── 📂 shell/
│               ├── 📂 notification-bell/      ← NEW
│               ├── 📂 toast/
│               └── 📂 navbar/
│
├── 📂 ui/tests/                               # Angular spec tests
│   ├── Component-tests/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── events.spec.ts
│   │   ├── registrations.spec.ts
│   │   ├── attendance-prediction.spec.ts
│   │   ├── no-show-prediction.spec.ts
│   │   ├── user-attendance-prediction.spec.ts
│   │   ├── resource-planning.spec.ts
│   │   ├── reports.spec.ts
│   │   ├── notification-bell.spec.ts
│   │   ├── shell.spec.ts
│   │   ├── toast.spec.ts
│   │   ├── navbar.spec.ts
│   │   └── landing.spec.ts
│   └── Service-tests/
│       ├── auth.service.spec.ts
│       ├── api.services.spec.ts
│       ├── toast.service.spec.ts
│       └── notification.service.spec.ts
│
└── 📂 tools/ 
    ├── fastapi/                             # Python FastAPI ML service
        ├── main.py
        ├── requirements.txt
        ├── attendance_prediction_model.pkl
        ├── no_show_prediction_model.pkl
        └── user_attendance_model.pkl
    ├── train_models.py
    ├── generate_datasets.py    
    ├── event_dataset.csv
    ├── user_event_dataset.csv
```
---

## 8. Running the System

```bash
# 1. Start SQL Server and apply migrations
cd api/src
dotnet ef database update
dotnet run                        # → http://localhost:5000

# 2. Start FastAPI ML service
cd tools
cd fastapi
venv\Scripts\activate             # Windows
# source venv/bin/activate        # macOS / Linux

# Install dependencies
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  # → http://localhost:8000

# 3. Start Angular frontend
cd ui
npm install
ng serve                          # → http://localhost:4200
```
