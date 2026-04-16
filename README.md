# 🤖 AI Event Attendance Prediction System

A full-stack AI-powered event management platform that uses machine learning to predict attendance, flag no-shows, and optimize resource planning — built with **FastAPI + Python**, **ASP.NET Core C#**, and **Angular 17**.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                      │
│              http://localhost:4200                       │
│         (UI, Auth, Events, Predictions, Reports)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + JWT
                       ▼
┌─────────────────────────────────────────────────────────┐
│              ASP.NET Core Web API (C#)                  │
│              http://localhost:5000                       │
│  (Auth, Events, Registrations, Reports, Prediction Proxy)│
└──────────┬────────────────────────┬────────────────────-┘
           │ SQL Server (EF Core)   │ HTTP
           ▼                        ▼
  ┌─────────────────┐   ┌──────────────────────────────┐
  │   SQL Server DB  │   │     FastAPI (Python)         │
  │  EventPrediction │   │   http://localhost:8000      │
  │       DB         │   │  (ML Models: 3 pkl files)    │
  └─────────────────┘   └──────────────────────────────┘
```

---

## 📁 Complete Directory Structure

```
Diya-ai-event-attendance-prediction/
│
├── docs/                                     # Architecture, API contracts, diagrams
│   ├── architecture-overview.md
│   ├── api-contracts.md
│   ├── data-flow-diagram.md
│   └── assumptions.md
│
├── 📂 api/                                    # Backend (.NET Core)
│   │
│   ├── 📂 src/
│   │   │
│   │   ├── 📂 Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── EventsController.cs
│   │   │   ├── RegistrationsController.cs
│   │   │   ├── PredictionsController.cs
│   │   │   └── ReportsController.cs
│   │   │
│   │   ├── 📂 Models/
│   │   │   └── Models.cs
│   │   │
│   │   ├── 📂 DTOs/
│   │   │   └── DTOs.cs
│   │   │
│   │   ├── 📂 Data/
│   │   │   └── AppDbContext.cs
│   │   │
│   │   ├── 📂 Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── EventService.cs
│   │   │   ├── RegistrationService.cs
│   │   │   ├── PredictionService.cs
│   │   │   └── ReportService.cs
│   │   │
│   │   ├── 📂 Middleware/
│   │   │   └── ExceptionMiddleware.cs
│   │   │
│   │   ├── 📂 Migrations/
│   │   │   ├── InitialCreate.cs
│   │   │   └── AppDbContextModelSnapshot.cs
│   │   │
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── EventPredictionAPI.csproj
│   │
│   ├── 📂 tests/                              # Backend tests (MSTest)
│   │   ├── AuthServiceTests.cs
│   │   ├── EventServiceTests.cs
│   │   ├── PredictionServiceTests.cs
│   │   └── RegistrationServiceTests.cs
│
├── 📂 ui/                                     # Frontend (Angular)
│   │
│   ├── 📂 src/
│   │   │
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles.scss
│   │   │
│   │   └── 📂 app/
│   │       │
│   │       ├── app.module.ts
│   │       ├── app-routing.module.ts
│   │       ├── app.component.ts
│   │       ├── app.component.html
│   │       ├── app.component.scss
│   │       │
│   │       ├── 📂 models/
│   │       │   └── models.ts
│   │       │
│   │       ├── 📂 services/
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.service.spec.ts
│   │       │   ├── api.services.ts
│   │       │   └── api.services.spec.ts
│   │       │
│   │       ├── 📂 guards/
│   │       │   └── auth.guard.ts
│   │       │
│   │       ├── 📂 interceptors/
│   │       │   └── auth.interceptor.ts
│   │       │
│   │       ├── 📂 components/
│   │       │
│   │       │   ├── 📂 landing/
│   │       │   │   ├── landing.component.ts
│   │       │   │   ├── landing.component.html
│   │       │   │   └── landing.component.scss
│   │       │   │
│   │       │   ├── 📂 auth/
│   │       │   │   ├── 📂 login/
│   │       │   │   │   ├── login.component.ts
│   │       │   │   │   ├── login.component.html
│   │       │   │   │   └── login.component.scss
│   │       │   │   │
│   │       │   │   └── 📂 signup/
│   │       │   │       ├── signup.component.ts
│   │       │   │       ├── signup.component.html
│   │       │   │       └── signup.component.scss
│   │       │   │
│   │       │   ├── 📂 shared/
│   │       │   │   ├── 📂 shell/
│   │       │   │   │   ├── shell.component.ts
│   │       │   │   │   ├── shell.component.html
│   │       │   │   │   └── shell.component.scss
│   │       │   │   │
│   │       │   │   └── 📂 navbar/
│   │       │   │       ├── navbar.component.ts
│   │       │   │       ├── navbar.component.html
│   │       │   │       └── navbar.component.scss
│   │       │   │
│   │       │   ├── 📂 dashboard/
│   │       │   │   ├── dashboard.component.ts
│   │       │   │   ├── dashboard.component.html
│   │       │   │   └── dashboard.component.scss
│   │       │   │
│   │       │   ├── 📂 events/
│   │       │   │   ├── events.component.ts
│   │       │   │   ├── events.component.html
│   │       │   │   └── events.component.scss
│   │       │   │
│   │       │   ├── 📂 registrations/
│   │       │   │   ├── registrations.component.ts
│   │       │   │   ├── registrations.component.html
│   │       │   │   └── registrations.component.scss
│   │       │   │
│   │       │   ├── 📂 predictions/
│   │       │   │   ├── 📂 attendance/
│   │       │   │   │   ├── attendance.component.ts
│   │       │   │   │   ├── attendance.component.html
│   │       │   │   │   └── attendance.component.scss
│   │       │   │   │
│   │       │   │   ├── 📂 no-show/
│   │       │   │   │   ├── no-show.component.ts
│   │       │   │   │   ├── no-show.component.html
│   │       │   │   │   └── no-show.component.scss
│   │       │   │   │
│   │       │   │   └── 📂 user-attendance/
│   │       │   │       ├── user-attendance.component.ts
│   │       │   │       ├── user-attendance.component.html
│   │       │   │       └── user-attendance.component.scss
│   │       │   │
│   │       │   ├── 📂 resource-planning/
│   │       │   │   ├── resource-planning.component.ts
│   │       │   │   ├── resource-planning.component.html
│   │       │   │   └── resource-planning.component.scss
│   │       │   │
│   │       │   └── 📂 reports/
│   │       │       ├── reports.component.ts
│   │       │       ├── reports.component.html
│   │       │       └── reports.component.scss
│   │
│   ├── 📂 tests/                              # UI tests (separate as per guideline)
│   │   ├── auth.service.spec.ts
│   │   ├── event.service.spec.ts
│   │   └── registration.service.spec.ts
│   │
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.spec.json
│
├── 📂 tools/                                  # ML & utilities
│   │
│   └── 📂 fastapi/
│       ├── main.py
│       ├── requirements.txt
│       ├── attendance_prediction_model.pkl
│       ├── no_show_prediction_model.pkl
│       └── user_attendance_model.pkl
│
├── 📂 build/ (optional)                       # CI / scripts (optional)
│
├── README.md
└── .gitignore
```

---

## 🔧 Prerequisites

| Tool | Version | Download |
|---|---|---|
| Python | 3.9+ | [python.org](https://python.org) |
| .NET SDK | 8.0+ | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| SQL Server | 2019+ | [microsoft.com/sql](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| Angular CLI | 17+ | `npm install -g @angular/cli` |

---

## ⚙️ Setup & Installation

### Step 1 — Clone / Unzip the Project

```bash

mkdir Diyabaghla-ai-event-prediction
cd Diyabaghla-ai-event-prediction


```

---

### Step 2 — FastAPI Setup (Python ML Service)

```bash
cd tools/
cd fastapi/

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate          # macOS / Linux
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Place your trained ML model files in this folder:
# - attendance_prediction_model.pkl
# - no_show_prediction_model.pkl
# - user_attendance_model.pkl

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

✅ FastAPI runs at: **http://localhost:8000**
📖 Swagger docs at: **http://localhost:8000/docs**

---
## How to Run Tests

```bash
# Backend tests (when added)
cd api/tests
dotnet test

# Frontend tests (when added)
cd ui/tests
ng test
```

### Step 3 — Backend Setup (ASP.NET Core)

#### 3a. Configure Database & Settings

Edit `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EventPredictionDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHere_AtLeast32Characters!!",
    "Issuer": "EventPredictionAPI",
    "Audience": "EventPredictionClient",
    "ExpiresInHours": "24"
  },
  "FastAPI": {
    "BaseUrl": "http://localhost:8000"
  }
}
```

> ⚠️ **Important:** Change `Jwt:Key` to a strong random string before deploying.

#### 3b. Run Database Migrations

```bash
cd api/

# Install EF Core CLI tools (if not already installed)
dotnet tool install --global dotnet-ef

# Restore NuGet packages
dotnet restore

# Apply migrations (creates DB and all tables)
dotnet ef database update
```

#### 3c. Start the API

```bash
dotnet run
```

✅ API runs at: **http://localhost:5000**
📖 Swagger UI at: **http://localhost:5001** (HTTPS, root URL in Development)

---

### Step 4 — Frontend Setup (Angular)

```bash
cd ui/

# Install npm packages
npm install

# Configure API URL (if different from default)
# Edit: src/environments/environment.ts
# apiUrl: 'http://localhost:5000/api'

# Start development server
ng serve
```

✅ Frontend runs at: **http://localhost:4200**

---

## 🚀 Running All Three Services Together

Open **three terminal windows** and run each service:

```bash
# Terminal 1 — FastAPI (ML Models)
cd tools
cd fastapi/
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — ASP.NET Core API
cd api/
dotnet run

# Terminal 3 — Angular Frontend
cd ui/
ng serve
```

Then open your browser at **http://localhost:4200**

---

## 🗄️ Database Schema

```
┌──────────────────────────────────────┐
│               Users                  │
├──────────────────────────────────────┤
│ Id (PK)  FullName  Email (Unique)    │
│ PasswordHash  Role  CreatedAt        │
└──────────────────┬───────────────────┘
                   │ 1:N
┌──────────────────▼───────────────────┐
│            Registrations             │
├──────────────────────────────────────┤
│ Id (PK)  UserId (FK)  EventId (FK)  │
│ RegistrationDate  Status            │
│ DaysBeforeRegistration               │
│ PastUserAttendanceRate               │
└──────────────────┬───────────────────┘
                   │ N:1
┌──────────────────▼───────────────────┐
│               Events                 │
├──────────────────────────────────────┤
│ Id (PK)  Title  Description          │
│ EventType  Mode  Department          │
│ EventDate  DayOfWeek  DurationHours  │
│ SpeakerRating  ReminderSent          │
│ PastAttendanceRate  Weather          │
│ TicketPrice  LocationCapacity        │
│ CreatedAt                            │
└──────────────────────────────────────┘
```

---

## 🌐 API Reference Summary

### FastAPI (Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict-attendance` | Predict total attendance count |
| `POST` | `/predict-no-show` | Predict Attend / Not Attend + probability |
| `POST` | `/predict-user-attendance` | Return probability score (0–1) |

### ASP.NET Core API (Port 5000)

#### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, receive JWT |

#### Events
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | User | Get all events |
| `GET` | `/api/events/{id}` | User | Get event by ID |
| `POST` | `/api/events` | Admin | Create event |
| `PUT` | `/api/events/{id}` | Admin | Update event |
| `DELETE` | `/api/events/{id}` | Admin | Delete event |

#### Registrations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/registrations` | User | Register for event |
| `PATCH` | `/api/registrations/{id}/cancel` | User | Cancel registration |
| `GET` | `/api/registrations/my` | User | Get my registrations |
| `GET` | `/api/registrations/event/{id}` | Admin | Get event registrations |
| `GET` | `/api/registrations` | Admin | Get all registrations |

#### Predictions (proxies to FastAPI)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/predictions/attendance/{eventId}` | User | Predict attendance |
| `GET` | `/api/predictions/no-show/{eventId}` | User | Predict no-show |
| `GET` | `/api/predictions/user-attendance/{eventId}` | User | User probability score |

#### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports/attendance-vs-registration` | Admin | Attendance vs registrations |
| `GET` | `/api/reports/cancelled-vs-registered` | Admin | Cancellation summary |
| `GET` | `/api/reports/event-performance` | Admin | Event fill rates & ratings |

---

## 🔒 Authentication Flow

```
User → POST /api/auth/login
     ← JWT Token (24h expiry)

All subsequent requests:
Authorization: Bearer <token>

Angular AuthInterceptor automatically attaches the token.
401 response → auto logout → redirect to /login.
```

### User Roles

| Role | Permissions |
|---|---|
| `User` | View events, register/cancel, run predictions for self |
| `Admin` | All of above + create/edit/delete events, view all registrations, view reports |

> To create an Admin: sign up normally, then update the `Role` column in the `Users` table to `"Admin"`.

---

## 🔄 Data Flow: Prediction Request

```
Angular (select event) 
  → GET /api/predictions/attendance/{eventId}    [ASP.NET Core]
  → Load event from SQL Server DB
  → POST http://localhost:8000/predict-attendance [FastAPI]
       { event_type, mode, department, registrations,
         day_of_week, duration_hours, speaker_rating,
         reminder_sent, past_attendance_rate,
         weather, ticket_price, location_capacity }
  ← { predicted_attendance: 387 }               [FastAPI]
  ← { predictedAttendance: 387 }                [ASP.NET Core]
← Display result in Angular UI
```

---

## 🧪 First Time Usage

1. **Open** http://localhost:4200
2. **Click** "Get Started" → Create your account
3. **Login** with your credentials
4. **Create an event** (Admin role required — update DB role manually for first admin)
5. **Register** for the event via Registrations page
6. **Run Attendance Prediction** → selects event → click Predict
7. **Run No-Show Prediction** → see if you'll attend
8. **View Resource Planning** → get chairs/food/staff numbers
9. **View Reports** → see bar/donut/line charts

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `Prediction failed` error | Ensure FastAPI is running on port 8000 with `.pkl` model files present |
| `401 Unauthorized` | Token expired → log out and log in again |
| `Cannot connect to DB` | Check SQL Server is running and connection string in `appsettings.json` |
| `CORS error` in browser | Ensure ASP.NET Core API is running; CORS is open by default |
| Angular shows blank page | Run `ng serve` and check browser console for errors |
| `dotnet ef not found` | Run `dotnet tool install --global dotnet-ef` |
| Model file not found | Place `.pkl` files in the `fastapi/` directory |

---

## 📦 Tech Stack Summary

| Layer | Technology | Key Libraries |
|---|---|---|
| **ML Service** | Python 3.9 + FastAPI | `joblib`, `scikit-learn`, `pandas`, `uvicorn` |
| **Backend API** | C# / .NET 8 + ASP.NET Core | Entity Framework Core, BCrypt.Net, JWT Bearer |
| **Database** | SQL Server 2019+ | — |
| **Frontend** | Angular 17 + TypeScript | RxJS, Reactive Forms, Canvas API (charts) |
| **Auth** | JWT (HS256) | 24h token, role-based access |
| **Styling** | SCSS design system | Syne + DM Sans fonts, CSS variables |

---

## 📄 License

MIT License — free to use, modify, and distribute.

