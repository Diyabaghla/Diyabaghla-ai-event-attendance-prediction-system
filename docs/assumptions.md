# Assumptions — AI Event Attendance Prediction System

This document lists all assumptions made during the design, development, and testing of the AI Event Attendance Prediction System. These assumptions define the boundaries within which the system is expected to operate correctly.

---

## 1. Dataset & Machine Learning

### 1.1 Synthetic but Realistic Data
The training datasets (`event_dataset.csv` with 30,000 rows and `user_event_dataset.csv` with 40,000 rows) are **synthetically generated** using realistic attendance logic. They are not derived from real historical event data. The attendance patterns and feature relationships are designed to reflect real-world behavior.

### 1.2 Attendance Logic is Representative
The following rules embedded in dataset generation are assumed to reflect real-world tendencies:
- Webinars have higher online participation (+10%)
- Sports and cultural events attract more footfall (+15%)
- Weekend events see higher turnout (+10%)
- Reminder notifications improve attendance (+5%)
- Speaker ratings above 4.0 increase attendance (+5%)
- Rainy or stormy weather reduces offline attendance (−10%)
- Offline events are naturally capped at venue capacity

### 1.3 Feature Stability
It is assumed that the 12 features used for training are consistently available when making predictions. If an event is missing values for `speaker_rating`, `weather`, or `past_attendance_rate`, the model may produce unreliable results.

### 1.4 Model Generalization
The trained models are assumed to generalize reasonably to new events that share the same feature distributions as the training data. Events with highly unusual characteristics (e.g., a webinar with 10,000 registrations) may fall outside the model's learned range.

### 1.5 Models Are Pre-trained
All three `.pkl` model files (`attendance_prediction_model.pkl`, `no_show_prediction_model.pkl`, `user_attendance_model.pkl`) are assumed to be trained and saved before the FastAPI service starts. If the files are missing, the service will log a warning and all prediction endpoints will return 503.

---

## 2. System & Infrastructure

### 2.1 All Three Services Must Run Simultaneously
The system requires all three components running at the same time for full functionality:
- Angular frontend at `http://localhost:4200`
- ASP.NET Core API at `http://localhost:5000`
- FastAPI ML service at `http://localhost:8000`

If FastAPI is unavailable, prediction and resource planning features will fail, but event management and registration features will continue to work.

### 2.2 Local Development Environment
The system is designed for local development. The following are assumed:
- SQL Server  is installed and accessible via `(Server=localhost)`
- The database `EventPredictionDB` exists and migrations have been applied
- All three services are run manually using `ng serve`, `dotnet run`, and `uvicorn`

### 2.3 Port Availability
Ports 4200, 5000, and 8000 are assumed to be free on the developer's machine. No other service should be occupying these ports when running the application.

### 2.4 HTTPS Not Required in Development
The system uses HTTP for all local service communication. HTTPS redirection is disabled in the Development environment. For production deployment, HTTPS should be enforced.

### 2.5 Network Connectivity Between Services
The ASP.NET Core API communicates with FastAPI via `http://localhost:8000`. It is assumed that both services run on the same machine. Cross-machine or containerized deployment is not covered by this implementation.

---

## 3. Authentication & Users

### 3.1 First Admin Must Be Set Manually
The system has no self-serve Admin promotion. The first Admin must be set directly in the database after signing up:
```sql
UPDATE Users SET Role = 'Admin' WHERE Email = 'your@email.com';
```
After this, the user must log out and back in to receive a new JWT with the Admin role.

### 3.2 All Users Start as "User" Role
Every signup creates an account with `Role = "User"` by default. Granting Admin access is an explicit administrative action, not an automatic one. This follows the principle of least privilege.

### 3.3 JWT Tokens Are Valid for 24 Hours
Tokens expire 24 hours after issuance. After expiry, the user is automatically logged out by the Angular interceptor when the next API call returns 401. Re-login is required.

### 3.4 Token Stored in localStorage
JWT tokens are stored in `localStorage` for simplicity in a local development context. It is acknowledged that `HttpOnly` cookies would be more secure for a production deployment.

### 3.5 Users Are Authenticated Before Any Action
All non-public endpoints require a valid JWT token. Any request without a token or with an expired token is rejected with 401. The Angular `AuthGuard` prevents unauthenticated users from accessing protected routes entirely.

### 3.6 Email Is Unique Per User
No two users can share the same email address. The backend returns 409 Conflict if a signup is attempted with an already-registered email.

---

## 4. Business Logic

### 4.1 One Registration Per User Per Event
A user cannot register for the same event twice. The backend checks for existing active registrations and returns 409 Conflict if a duplicate is attempted.

### 4.2 Cancellation Does Not Delete the Record
Cancelling a registration changes its `Status` from `Registered` to `Cancelled`. The record is retained in the database for analytics and reporting purposes.

### 4.3 Event Deletion Cascades to Registrations
Deleting an event removes all associated registration records via EF Core cascade delete. This is a destructive and irreversible operation, confirmed by a delete dialog in the UI.

### 4.4 Past Attendance Rate Is User-Provided
The `pastUserAttendanceRate` field used during registration is entered manually by the user (or defaulted to 0.7). It is not computed from historical data automatically, as the system does not track actual event attendance in real time.

### 4.5 Resource Planning Uses a Fixed Buffer
Resource quantities are calculated with an 8% safety buffer by default (adjustable via UI slider from 0%–25%). The formulas assume all quantities should cover at minimum the predicted attendance plus the buffer.

### 4.6 `DayOfWeek` Is Derived From `EventDate`
The `dayOfWeek` field stored in the Events table is automatically derived from the `eventDate` on the backend. It does not need to be submitted in the request body.

---

## 5. Frontend

### 5.1 Modern Browser Required
The Angular application uses the HTML5 Canvas API, CSS Grid, CSS custom properties, and `requestAnimationFrame`. It is assumed the user is running a modern browser (Chrome 100+, Firefox 100+, Edge 100+). Internet Explorer is not supported.

### 5.2 JavaScript Must Be Enabled
The Angular SPA requires JavaScript. The application does not provide a server-side rendered or no-JS fallback.

### 5.3 Screen Resolution
The UI is designed for desktop screens with a minimum width of 960px. Mobile and tablet responsiveness is partially supported via CSS media queries but is not the primary design target.

### 5.4 Angular CLI and Node.js Are Installed
It is assumed the developer has Angular CLI 17+ and Node.js 18+ installed globally. The `ng serve` command must be available in the terminal.

---

## 6. Scope & Limitations

### 6.1 No Real-Time Updates
The system does not use WebSockets or server-sent events. Data is fetched on page load or after a user action. There is no live push of new registrations or predictions to other users' browsers.

### 6.2 No Email Notifications
Although `reminderSent` is a feature used in predictions, the system does not actually send email reminders. It is a field the admin sets manually when creating or editing an event.

### 6.3 No Payment Processing
Ticket price is recorded as a field and used in ML predictions, but there is no payment gateway, checkout flow, or invoice generation.

### 6.4 No Multi-Tenancy
The system is designed for a single organization. All users and events share the same database with no tenant isolation.

### 6.5 Predictions Are Estimates
All ML predictions are probabilistic estimates based on synthetic training data. They should be treated as decision-support tools rather than definitive forecasts. Actual attendance may differ.

### 6.6 No Offline Support
The application requires an active connection to the backend API. There is no service worker, offline caching, or PWA implementation.
