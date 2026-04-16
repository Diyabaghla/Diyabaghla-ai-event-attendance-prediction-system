

# import os
# import joblib
# import numpy as np
# import pandas as pd
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field, validator
# from typing import Literal
# import uvicorn
 
# # ─────────────────────────────────────────────
# # App Setup
# # ─────────────────────────────────────────────
# app = FastAPI(
#     title="AI Event Attendance Prediction API",
#     description="Predict event attendance, no-shows, and user attendance probability using trained ML models.",
#     version="1.0.0",
# )
 
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
 
# # ─────────────────────────────────────────────
# # Load Models
# # ─────────────────────────────────────────────
# MODEL_DIR = os.getenv("MODEL_DIR", ".")
 
# def load_model(name: str):
#     path = os.path.join(MODEL_DIR, name)
#     if not os.path.exists(path):
#         raise FileNotFoundError(f"Model file not found: {path}")
#     return joblib.load(path)
 
# try:
#     attendance_model = load_model("attendance_prediction_model.pkl")
#     no_show_model = load_model("no_show_prediction_model.pkl")
#     user_attendance_model = load_model("user_attendance_model.pkl")
#     print("✅ All models loaded successfully.")
# except FileNotFoundError as e:
#     print(f"⚠️  Warning: {e}")
#     attendance_model = None
#     no_show_model = None
#     user_attendance_model = None
 
 
# # ─────────────────────────────────────────────
# # Pydantic Schemas
# # ─────────────────────────────────────────────
# class AttendancePredictionRequest(BaseModel):
#     event_type: str = Field(..., example="Conference", description="Type of event (e.g., Webinar, Workshop, Conference)")
#     mode: Literal["Online", "Offline", "Hybrid"] = Field(..., example="Online")
#     department: str = Field(..., example="Engineering")
#     registrations: int = Field(..., ge=1, example=200)
#     day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] = Field(..., example="Wednesday")
#     duration_hours: float = Field(..., gt=0, le=24, example=2.5)
#     speaker_rating: float = Field(..., ge=0.0, le=5.0, example=4.2)
#     reminder_sent: bool = Field(..., example=True)
#     past_attendance_rate: float = Field(..., ge=0.0, le=1.0, example=0.75)
#     weather: Literal["Clear", "Rainy", "Cloudy", "Snowy", "Stormy"] = Field(..., example="Clear")
#     ticket_price: float = Field(..., ge=0.0, example=0.0)
#     location_capacity: int = Field(..., ge=1, example=500)
 
 
# class NoShowPredictionRequest(BaseModel):
#     event_type: str = Field(..., example="Workshop")
#     mode: Literal["Online", "Offline", "Hybrid"] = Field(..., example="Offline")
#     department: str = Field(..., example="Marketing")
#     day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] = Field(..., example="Friday")
#     past_user_attendance_rate: float = Field(..., ge=0.0, le=1.0, example=0.6)
#     days_before_registration: int = Field(..., ge=0, example=7)
#     reminder_sent: bool = Field(..., example=True)
 
 
# class UserAttendancePredictionRequest(BaseModel):
#     event_type: str = Field(..., example="Seminar")
#     mode: Literal["Online", "Offline", "Hybrid"] = Field(..., example="Hybrid")
#     department: str = Field(..., example="HR")
#     day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] = Field(..., example="Tuesday")
#     past_user_attendance_rate: float = Field(..., ge=0.0, le=1.0, example=0.85)
#     days_before_registration: int = Field(..., ge=0, example=3)
#     reminder_sent: bool = Field(..., example=False)
 
 
# # ─────────────────────────────────────────────
# # Helper: Encode features to DataFrame
# # ─────────────────────────────────────────────
# DAY_MAP = {
#     "Monday": 0, "Tuesday": 1, "Wednesday": 2,
#     "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6
# }
 
# def encode_attendance_features(data: AttendancePredictionRequest) -> pd.DataFrame:
#     return pd.DataFrame([{
#         "event_type": data.event_type,
#         "mode": data.mode,
#         "department": data.department,
#         "registrations": data.registrations,
#         "day_of_week": DAY_MAP[data.day_of_week],
#         "duration_hours": data.duration_hours,
#         "speaker_rating": data.speaker_rating,
#         "reminder_sent": int(data.reminder_sent),
#         "past_attendance_rate": data.past_attendance_rate,
#         "weather": data.weather,
#         "ticket_price": data.ticket_price,
#         "location_capacity": data.location_capacity,
#     }])
 
# def encode_no_show_features(data) -> pd.DataFrame:
#     return pd.DataFrame([{
#         "event_type": data.event_type,
#         "mode": data.mode,
#         "department": data.department,
#         "day_of_week": DAY_MAP[data.day_of_week],
#         "past_user_attendance_rate": data.past_user_attendance_rate,
#         "days_before_registration": data.days_before_registration,
#         "reminder_sent": int(data.reminder_sent),
#     }])
 
 
# # ─────────────────────────────────────────────
# # Routes
# # ─────────────────────────────────────────────
# @app.get("/", tags=["Health"])
# def root():
#     return {
#         "status": "running",
#         "models_loaded": {
#             "attendance_prediction_model": attendance_model is not None,
#             "no_show_prediction_model": no_show_model is not None,
#             "user_attendance_model": user_attendance_model is not None,
#         }
#     }
 
 
# @app.post("/predict-attendance", tags=["Predictions"])
# def predict_attendance(request: AttendancePredictionRequest):
#     """
#     Predicts the expected number of attendees for an event.
#     """
#     if attendance_model is None:
#         raise HTTPException(status_code=503, detail="attendance_prediction_model.pkl not loaded.")
 
#     try:
#         features = encode_attendance_features(request)
#         prediction = attendance_model.predict(features)
#         predicted = int(round(float(prediction[0])))
#         return {"predicted_attendance": predicted}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
 
 
# @app.post("/predict-no-show", tags=["Predictions"])
# def predict_no_show(request: NoShowPredictionRequest):
#     """
#     Predicts whether a registered user will show up or not.
#     Returns 'Attend' or 'Not Attend' with probability.
#     """
#     if no_show_model is None:
#         raise HTTPException(status_code=503, detail="no_show_prediction_model.pkl not loaded.")
 
#     try:
#         features = encode_no_show_features(request)
#         prediction = no_show_model.predict(features)
#         probability_scores = no_show_model.predict_proba(features)
 
#         label = "Attend" if int(prediction[0]) == 1 else "Not Attend"
#         attend_prob = float(probability_scores[0][1])
 
#         return {
#             "prediction": label,
#             "probability": round(attend_prob, 4),
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
 
 
# @app.post("/predict-user-attendance", tags=["Predictions"])
# def predict_user_attendance(request: UserAttendancePredictionRequest):
#     """
#     Predicts the probability that a specific user will attend an event.
#     Returns a probability score between 0 and 1.
#     """
#     if user_attendance_model is None:
#         raise HTTPException(status_code=503, detail="user_attendance_model.pkl not loaded.")
 
#     try:
#         features = encode_no_show_features(request)
#         probability_scores = user_attendance_model.predict_proba(features)
#         attend_prob = float(probability_scores[0][1])
 
#         return {"probability": round(attend_prob, 4)}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
 
 
# # ─────────────────────────────────────────────
# # Entry Point
# # ─────────────────────────────────────────────
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import uvicorn

app = FastAPI(title="AI Event Attendance Prediction API", version="2.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

MODEL_DIR = os.getenv("MODEL_DIR", ".")

def load_model(name):
    path = os.path.join(MODEL_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model not found: {path}")
    return joblib.load(path)

try:
    attendance_model      = load_model("attendance_prediction_model.pkl")
    no_show_model         = load_model("no_show_prediction_model.pkl")
    user_attendance_model = load_model("user_attendance_model.pkl")
    print("All 3 models loaded.")
except FileNotFoundError as e:
    print(f"Warning: {e}")
    attendance_model = no_show_model = user_attendance_model = None

EventTypeEnum  = Literal['Conference','Workshop','Seminar','Webinar','Meetup',
                          'Training','Summit','Sports','Cultural']
ModeEnum       = Literal['Online','Offline','Hybrid']
DepartmentEnum = Literal['Engineering','Marketing','HR','Sales',
                          'Finance','Operations','Design','Leadership']
DayEnum        = Literal['Monday','Tuesday','Wednesday','Thursday',
                          'Friday','Saturday','Sunday']
WeatherEnum    = Literal['Clear','Cloudy','Rainy','Snowy','Stormy']

WEEKEND_DAYS = {'Saturday', 'Sunday'}

class AttendanceRequest(BaseModel):
    event_type:           EventTypeEnum  = Field(..., example="Webinar")
    mode:                 ModeEnum       = Field(..., example="Online")
    department:           DepartmentEnum = Field(..., example="Engineering")
    registrations:        int            = Field(..., ge=1, example=300)
    day_of_week:          DayEnum        = Field(..., example="Saturday")
    duration_hours:       float          = Field(..., gt=0, le=24, example=2.0)
    speaker_rating:       float          = Field(..., ge=0.0, le=5.0, example=4.5)
    reminder_sent:        bool           = Field(..., example=True)
    past_attendance_rate: float          = Field(..., ge=0.0, le=1.0, example=0.70)
    weather:              WeatherEnum    = Field(..., example="Clear")
    ticket_price:         float          = Field(..., ge=0.0, example=0.0)
    location_capacity:    int            = Field(..., ge=1, example=500)

class NoShowRequest(BaseModel):
    event_type:                EventTypeEnum  = Field(..., example="Sports")
    mode:                      ModeEnum       = Field(..., example="Offline")
    department:                DepartmentEnum = Field(..., example="Marketing")
    day_of_week:               DayEnum        = Field(..., example="Saturday")
    past_user_attendance_rate: float          = Field(..., ge=0.0, le=1.0, example=0.65)
    days_before_registration:  int            = Field(..., ge=0, example=7)
    reminder_sent:             bool           = Field(..., example=True)

class UserAttendanceRequest(BaseModel):
    event_type:                EventTypeEnum  = Field(..., example="Cultural")
    mode:                      ModeEnum       = Field(..., example="Online")
    department:                DepartmentEnum = Field(..., example="HR")
    day_of_week:               DayEnum        = Field(..., example="Sunday")
    past_user_attendance_rate: float          = Field(..., ge=0.0, le=1.0, example=0.80)
    days_before_registration:  int            = Field(..., ge=0, example=3)
    reminder_sent:             bool           = Field(..., example=True)

def event_features(r: AttendanceRequest) -> pd.DataFrame:
    return pd.DataFrame([{
        'event_type': r.event_type, 'mode': r.mode,
        'department': r.department, 'day_of_week': r.day_of_week,
        'weather': r.weather,
        'registrations': r.registrations,
        'is_weekend': int(r.day_of_week in WEEKEND_DAYS),
        'duration_hours': r.duration_hours,
        'speaker_rating': r.speaker_rating,
        'reminder_sent': int(r.reminder_sent),
        'past_attendance_rate': r.past_attendance_rate,
        'ticket_price': r.ticket_price,
        'location_capacity': r.location_capacity,
    }])

def user_features(r) -> pd.DataFrame:
    return pd.DataFrame([{
        'event_type': r.event_type, 'mode': r.mode,
        'department': r.department, 'day_of_week': r.day_of_week,
        'past_user_attendance_rate': r.past_user_attendance_rate,
        'days_before_registration': r.days_before_registration,
        'reminder_sent': int(r.reminder_sent),
        'is_weekend': int(r.day_of_week in WEEKEND_DAYS),
    }])

@app.get("/")
def root():
    return {"status": "running", "version": "2.0.0",
            "models": {
                "attendance": attendance_model is not None,
                "no_show": no_show_model is not None,
                "user_attendance": user_attendance_model is not None
            }}

@app.post("/predict-attendance")
def predict_attendance(request: AttendanceRequest):
    if attendance_model is None:
        raise HTTPException(503, "Model not loaded.")
    try:
        pred = attendance_model.predict(event_features(request))
        return {"predicted_attendance": int(round(float(pred[0])))}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/predict-no-show")
def predict_no_show(request: NoShowRequest):
    if no_show_model is None:
        raise HTTPException(503, "Model not loaded.")
    try:
        feats = user_features(request)
        # no-show model uses event-level features — remap
        feats2 = pd.DataFrame([{
            'event_type': request.event_type, 'mode': request.mode,
            'department': request.department, 'day_of_week': request.day_of_week,
            'weather': 'Clear',
            'registrations': 100,
            'is_weekend': int(request.day_of_week in WEEKEND_DAYS),
            'duration_hours': 2.0, 'speaker_rating': 4.0,
            'reminder_sent': int(request.reminder_sent),
            'past_attendance_rate': request.past_user_attendance_rate,
            'ticket_price': 0.0, 'location_capacity': 300,
        }])
        label = "Attend" if no_show_model.predict(feats2)[0] == 1 else "Not Attend"
        prob  = round(float(no_show_model.predict_proba(feats2)[0][1]), 4)
        return {"prediction": label, "probability": prob}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/predict-user-attendance")
def predict_user_attendance(request: UserAttendanceRequest):
    if user_attendance_model is None:
        raise HTTPException(503, "Model not loaded.")
    try:
        prob = round(float(user_attendance_model.predict_proba(user_features(request))[0][1]), 4)
        return {"probability": prob}
    except Exception as e:
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
