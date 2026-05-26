# API Contracts — AI Event Attendance Prediction System

All ASP.NET Core API endpoints are available at: `http://localhost:5000/api`  
All FastAPI ML endpoints are available at: `http://localhost:8000`

**Authentication:** All protected endpoints require `Authorization: Bearer <token>` in the request header.

---

## Part 1 — ASP.NET Core API (Backend)

---

### 1.1 Auth Endpoints

---

#### POST /api/auth/signup

Creates a new user account. All new users receive the `User` role by default.

**Auth required:** No

**Request Body:**
```json
{
  "fullName": "Diya Bhatia",
  "email": "diya@example.com",
  "password": "SecurePass@123"
}
```

**Response — 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullName": "Diya Bhatia",
  "email": "diya@example.com",
  "role": "User"
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 409 Conflict | Email already registered |
| 400 Bad Request | Missing or invalid fields |

---

#### POST /api/auth/login

Authenticates an existing user and returns a JWT token.

**Auth required:** No

**Request Body:**
```json
{
  "email": "diya@example.com",
  "password": "SecurePass@123"
}
```

**Response — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fullName": "Diya Bhatia",
  "email": "diya@example.com",
  "role": "Admin"
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 401 Unauthorized | Incorrect password |
| 404 Not Found | Email not registered |

---

### 1.2 Event Endpoints

---

#### GET /api/events

Returns a list of all events with their active registration counts.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
[
  {
    "id": 1,
    "title": "AI Summit 2026",
    "description": "Annual AI conference for engineers.",
    "eventType": "Conference",
    "mode": "Online",
    "department": "Engineering",
    "eventDate": "2026-05-15T09:00:00",
    "dayOfWeek": "Friday",
    "durationHours": 4.0,
    "speakerRating": 4.5,
    "reminderSent": true,
    "pastAttendanceRate": 0.78,
    "weather": "Clear",
    "ticketPrice": 0.0,
    "locationCapacity": 500,
    "activeRegistrations": 312
  }
]
```

---

#### GET /api/events/{id}

Returns a single event by ID.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
{
  "id": 1,
  "title": "AI Summit 2026",
  "eventType": "Conference",
  "mode": "Online",
  "department": "Engineering",
  "eventDate": "2026-05-15T09:00:00",
  "dayOfWeek": "Friday",
  "durationHours": 4.0,
  "speakerRating": 4.5,
  "reminderSent": true,
  "pastAttendanceRate": 0.78,
  "weather": "Clear",
  "ticketPrice": 0.0,
  "locationCapacity": 500,
  "activeRegistrations": 312
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 404 Not Found | Event ID does not exist |

---

#### POST /api/events

Creates a new event. Admin only.

**Auth required:** Admin

**Request Body:**
```json
{
  "title": "AI Summit 2026",
  "description": "Annual AI conference for engineers.",
  "eventType": "Conference",
  "mode": "Online",
  "department": "Engineering",
  "eventDate": "2026-05-15T09:00:00",
  "durationHours": 4.0,
  "speakerRating": 4.5,
  "reminderSent": true,
  "pastAttendanceRate": 0.78,
  "weather": "Clear",
  "ticketPrice": 0.0,
  "locationCapacity": 500
}
```

**Response — 201 Created:**
```json
{
  "id": 6,
  "title": "AI Summit 2026",
  "eventType": "Conference",
  "mode": "Online",
  "department": "Engineering",
  "eventDate": "2026-05-15T09:00:00",
  "dayOfWeek": "Friday",
  "locationCapacity": 500,
  "activeRegistrations": 0
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 400 Bad Request | Missing required fields |
| 403 Forbidden | Non-admin user attempted to create |

---

#### PUT /api/events/{id}

Updates an existing event. Admin only.

**Auth required:** Admin

**Request Body:** Same structure as POST /api/events

**Response — 200 OK:** Updated event object

**Error Responses:**

| Status | Reason |
|---|---|
| 404 Not Found | Event ID does not exist |
| 403 Forbidden | Non-admin user |

---

#### DELETE /api/events/{id}

Deletes an event and cascades to all its registrations. Admin only.

**Auth required:** Admin

**Response — 204 No Content**

**Error Responses:**

| Status | Reason |
|---|---|
| 404 Not Found | Event ID does not exist |
| 403 Forbidden | Non-admin user |

---

### 1.3 Registration Endpoints

---

#### POST /api/registrations

Registers the authenticated user for a specified event. Registration is rejected if the event date has already passed.

**Auth required:** User, Admin

**Request Body:**
```json
{
  "eventId": 1,
  "pastUserAttendanceRate": 0.75
}
```

**Response — 201 Created:**
```json
{
  "id": 45,
  "eventId": 1,
  "eventTitle": "AI Summit 2026",
  "userId": 3,
  "userName": "Diya Bhatia",
  "userEmail": "diya@example.com",
  "registrationDate": "2026-04-19T10:30:00",
  "status": "Registered",
  "daysBeforeRegistration": 26,
  "pastUserAttendanceRate": 0.75
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 400 Bad Request | Event has already ended — registration is closed |
| 409 Conflict | User already registered for this event |
| 404 Not Found | Event ID does not exist |

---

#### PATCH /api/registrations/{id}/cancel

Cancels an existing registration.

**Auth required:** User (own registrations), Admin (any)

**Response — 200 OK:**
```json
{
  "id": 45,
  "eventTitle": "AI Summit 2026",
  "status": "Cancelled"
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 404 Not Found | Registration ID does not exist |
| 400 Bad Request | Registration already cancelled |

---

#### GET /api/registrations/my

Returns all registrations for the currently authenticated user.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
[
  {
    "id": 45,
    "eventId": 1,
    "eventTitle": "AI Summit 2026",
    "registrationDate": "2026-04-19T10:30:00",
    "status": "Registered",
    "daysBeforeRegistration": 26,
    "pastUserAttendanceRate": 0.75
  }
]
```

---

#### GET /api/registrations/event/{eventId}

Returns all registrations for a specific event. Admin only.

**Auth required:** Admin

**Response — 200 OK:**
```json
[
  {
    "id": 45,
    "eventId": 1,
    "eventTitle": "AI Summit 2026",
    "userId": 3,
    "userName": "Diya Bhatia",
    "userEmail": "diya@example.com",
    "registrationDate": "2026-04-19T10:30:00",
    "status": "Registered",
    "daysBeforeRegistration": 26,
    "pastUserAttendanceRate": 0.75
  }
]
```

---

#### GET /api/registrations

Returns all registrations system-wide. Admin only.

**Auth required:** Admin

**Response — 200 OK:** Array of all registration objects (same structure as above)

---

### 1.4 Prediction Proxy Endpoints

These endpoints query the database for event features and forward the request to FastAPI.

---

#### GET /api/predictions/attendance/{eventId}

Fetches event data from the database and calls FastAPI to predict the expected number of attendees. The predicted value is capped at the number of active registrations.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
{
  "predictedAttendance": 387,
  "activeRegistrations": 312
}
```

| Field | Description |
|---|---|
| `predictedAttendance` | AI-estimated actual attendees. Never exceeds `activeRegistrations`. |
| `activeRegistrations` | Current registered count from the database. |

---

#### GET /api/predictions/no-show/{eventId}

Predicts whether the typical attendee for this event will attend or not.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
{
  "prediction": "Attend",
  "probability": 0.8839
}
```

| Field | Description |
|---|---|
| `prediction` | Either `"Attend"` or `"Not Attend"` |
| `probability` | Confidence score (0.0–1.0) for the `Attend` class |

---

#### GET /api/predictions/user-attendance/{eventId}

Returns the probability that the currently authenticated user will attend the given event.

**Auth required:** User, Admin

**Response — 200 OK:**
```json
{
  "probability": 0.9299,
  "prediction": "Attend"
}
```

| Field | Description |
|---|---|
| `probability` | Score from 0.0 (very unlikely) to 1.0 (very likely to attend) |
| `prediction` | Either `"Attend"` or `"Not Attend"` |

---

### 1.5 Report Endpoints

All report endpoints require Admin role.

---

#### GET /api/reports/cancelled-vs-registered

Returns system-wide registration status summary.

**Auth required:** Admin

**Response — 200 OK:**
```json
{
  "totalRegistrations": 12,
  "registered": 11,
  "cancelled": 1,
  "cancellationRate": 8.33
}
```

---

#### GET /api/reports/attendance-vs-registration

Returns per-event comparison of AI-predicted attendance vs actual registrations.

**Auth required:** Admin

**Response — 200 OK:**
```json
[
  {
    "eventId": 1,
    "eventTitle": "AI Summit 2026",
    "eventType": "Conference",
    "eventDate": "2026-05-15T09:00:00",
    "totalRegistrations": 320,
    "activeRegistrations": 312,
    "cancelledRegistrations": 8,
    "cancellationRate": 2.5,
    "predictedAttendance": 387,
    "locationCapacity": 500,
    "fillRate": 62.4
  }
]
```

---

#### GET /api/reports/event-performance

Returns a performance summary for every event.

**Auth required:** Admin

**Response — 200 OK:**
```json
[
  {
    "eventId": 1,
    "eventTitle": "AI Summit 2026",
    "department": "Engineering",
    "mode": "Online",
    "locationCapacity": 500,
    "activeRegistrations": 312,
    "fillRate": 62.4,
    "speakerRating": 4.5,
    "ticketPrice": 0.0,
    "pastAttendanceRate": 0.78
  }
]
```

---

#### GET /api/reports/department-breakdown

Returns events and registration counts broken down by department, event mode, and event type.

**Auth required:** Admin

**Response — 200 OK:**
```json
{
  "byDepartment": [
    {
      "department": "Engineering",
      "totalEvents": 5,
      "totalRegistrations": 300,
      "avgFillRate": 60.0,
      "avgSpeakerRating": 4.3
    }
  ],
  "byMode": [
    {
      "mode": "Online",
      "eventCount": 4,
      "percentage": 80.0
    }
  ],
  "byEventType": [
    {
      "eventType": "Conference",
      "eventCount": 3,
      "avgRating": 4.5
    }
  ]
}
```

---

#### GET /api/reports/weekly-trend

Returns weekly registration and cancellation counts for the last 8 weeks.

**Auth required:** Admin

**Response — 200 OK:**
```json
[
  {
    "weekStart": "2026-04-28T00:00:00",
    "registrations": 20,
    "cancellations": 3
  },
  {
    "weekStart": "2026-05-05T00:00:00",
    "registrations": 35,
    "cancellations": 5
  }
]
```

---

#### GET /api/reports/top-stats

Returns headline statistics across all events.

**Auth required:** Admin

**Response — 200 OK:**
```json
{
  "topEventByFillRate": "AI Summit 2026",
  "topEventFillRate": 62.4,
  "topEventByRegistrations": "Sales Training",
  "topEventRegistrationCount": 85,
  "topRatedEvent": "AI Summit 2026",
  "topRatedScore": 4.5,
  "totalEvents": 10,
  "totalRegistrations": 500,
  "avgFillRate": 48.2,
  "avgSpeakerRating": 4.1
}
```

---

### 1.6 Report Download Endpoints

CSV export endpoints for reports. All require Admin role.

---

#### GET /api/reports/download/event-performance-csv

Downloads event performance data as a CSV file.

**Auth required:** Admin

**Response — 200 OK**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="event-performance-{date}.csv"`

**CSV columns:** Event, Department, Mode, Capacity, Registrations, Fill Rate (%), Speaker Rating, Ticket Price, Past Att. Rate

---

#### GET /api/reports/download/registrations-csv

Downloads the attendance vs registration report as a CSV file.

**Auth required:** Admin

**Response — 200 OK**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="registrations-report-{date}.csv"`

**CSV columns:** Event, Type, Date, Total Registrations, Active, Cancelled, Cancellation Rate (%), AI Predicted

---

#### GET /api/reports/download/department-csv

Downloads the department breakdown report as a CSV file.

**Auth required:** Admin

**Response — 200 OK**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="department-report-{date}.csv"`

**CSV columns:** Department, Total Events, Total Registrations, Avg Fill Rate (%), Avg Speaker Rating

---

## Part 2 — FastAPI ML Service

All endpoints accept and return JSON. CORS is enabled for all origins.

---

### 2.1 POST /predict-attendance

Predicts the total expected number of attendees for an event.

**No auth required** (internal service — called by ASP.NET backend only)

**Request Body:**
```json
{
  "event_type": "Conference",
  "mode": "Online",
  "department": "Engineering",
  "registrations": 480,
  "day_of_week": "Friday",
  "duration_hours": 4.0,
  "speaker_rating": 4.5,
  "reminder_sent": true,
  "past_attendance_rate": 0.78,
  "weather": "Clear",
  "ticket_price": 0.0,
  "location_capacity": 500
}
```

**Allowed values:**

| Field | Allowed values |
|---|---|
| event_type | Conference, Workshop, Seminar, Webinar, Meetup, Training, Summit, Sports, Cultural |
| mode | Online, Offline, Hybrid |
| department | Engineering, Marketing, HR, Sales, Finance, Operations, Design, Leadership |
| day_of_week | Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday |
| weather | Clear, Cloudy, Rainy, Snowy, Stormy |

**Response — 200 OK:**
```json
{
  "predicted_attendance": 387
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 422 Unprocessable Entity | Invalid field value or missing required field |
| 503 Service Unavailable | Model file not loaded |

---

### 2.2 POST /predict-no-show

Classifies whether attendees are likely to show up or not, with a probability score.

**Request Body:**
```json
{
  "event_type": "Workshop",
  "mode": "Offline",
  "department": "Marketing",
  "day_of_week": "Saturday",
  "past_user_attendance_rate": 0.65,
  "days_before_registration": 7,
  "reminder_sent": true
}
```

**Response — 200 OK:**
```json
{
  "prediction": "Attend",
  "probability": 0.8839
}
```

`prediction` is either `"Attend"` or `"Not Attend"`.  
`probability` is the confidence score (0.0 to 1.0) for the `"Attend"` class.

**Error Responses:**

| Status | Reason |
|---|---|
| 422 Unprocessable Entity | Invalid or missing fields |
| 503 Service Unavailable | Model not loaded |

---

### 2.3 POST /predict-user-attendance

Returns the probability that a specific user will attend an event based on their behavioural profile.

**Request Body:**
```json
{
  "event_type": "Cultural",
  "mode": "Online",
  "department": "HR",
  "day_of_week": "Sunday",
  "past_user_attendance_rate": 0.80,
  "days_before_registration": 3,
  "reminder_sent": true
}
```

**Response — 200 OK:**
```json
{
  "probability": 0.9299
}
```

`probability` is a score from 0.0 (very unlikely to attend) to 1.0 (very likely to attend).

**Error Responses:**

| Status | Reason |
|---|---|
| 422 Unprocessable Entity | Invalid or missing fields |
| 503 Service Unavailable | Model not loaded |

---

### 2.4 GET /

Health check endpoint to verify the service is running and all models are loaded.

**Response — 200 OK:**
```json
{
  "status": "running",
  "version": "2.0.0",
  "models": {
    "attendance": true,
    "no_show": true,
    "user_attendance": true
  }
}
```

