import pandas as pd
import numpy as np
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, classification_report, confusion_matrix
)

print("=" * 60)
print("  AI EVENT ATTENDANCE PREDICTION — MODEL TRAINING")
print("=" * 60)

# ══════════════════════════════════════════════════════════════
# MODEL 1: ATTENDANCE PREDICTION (Regression)
# ══════════════════════════════════════════════════════════════
print("\n[MODEL 1] Attendance Prediction — RandomForestRegressor")
print("-" * 60)

df = pd.read_csv('event_dataset.csv')
print(f"  Rows: {len(df):,}")

CAT1 = ['event_type', 'mode', 'department', 'day_of_week', 'weather']
NUM1 = ['registrations', 'is_weekend', 'duration_hours', 'speaker_rating',
        'reminder_sent', 'past_attendance_rate', 'ticket_price', 'location_capacity']

X1 = df[CAT1 + NUM1]
y1 = df['actual_attendance']

X1_tr, X1_te, y1_tr, y1_te = train_test_split(X1, y1, test_size=0.2, random_state=42)

pre1 = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT1),
    ('num', 'passthrough', NUM1)
])

m1 = Pipeline([('pre', pre1),
               ('reg', RandomForestRegressor(n_estimators=100, max_depth=12,
                                             random_state=42, n_jobs=-1))])
print("  Training...")
m1.fit(X1_tr, y1_tr)
p1 = m1.predict(X1_te)

print(f"  MAE  : {mean_absolute_error(y1_te, p1):.2f}")
print(f"  RMSE : {np.sqrt(mean_squared_error(y1_te, p1)):.2f}")
print(f"  R²   : {r2_score(y1_te, p1):.4f}")

joblib.dump(m1, 'attendance_prediction_model.pkl')
print("  Saved → attendance_prediction_model.pkl")

sample1 = pd.DataFrame([{
    'event_type':'Webinar','mode':'Online','department':'Engineering',
    'day_of_week':'Saturday','weather':'Clear',
    'registrations':300,'is_weekend':1,'duration_hours':2.0,
    'speaker_rating':4.5,'reminder_sent':1,
    'past_attendance_rate':0.70,'ticket_price':0.0,'location_capacity':500
}])
print(f"  Sample → {int(m1.predict(sample1)[0])} attendees")

# ══════════════════════════════════════════════════════════════
# MODEL 2: NO-SHOW PREDICTION (Classification)
# ══════════════════════════════════════════════════════════════
print("\n[MODEL 2] No-Show Prediction — RandomForestClassifier")
print("-" * 60)

df['attended'] = (df['actual_attendance'] > df['registrations'] * 0.5).astype(int)
print(f"  Class balance: {df['attended'].value_counts().to_dict()}")

CAT2 = ['event_type', 'mode', 'department', 'day_of_week', 'weather']
NUM2 = ['registrations', 'is_weekend', 'duration_hours', 'speaker_rating',
        'reminder_sent', 'past_attendance_rate', 'ticket_price', 'location_capacity']

X2 = df[CAT2 + NUM2]
y2 = df['attended']

X2_tr, X2_te, y2_tr, y2_te = train_test_split(X2, y2, test_size=0.2, random_state=42)

pre2 = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT2),
    ('num', 'passthrough', NUM2)
])

m2 = Pipeline([('pre', pre2),
               ('clf', RandomForestClassifier(n_estimators=100, max_depth=12,
                                              random_state=42, n_jobs=-1))])
print("  Training...")
m2.fit(X2_tr, y2_tr)
p2 = m2.predict(X2_te)

print(f"  Accuracy : {accuracy_score(y2_te, p2):.4f}")
print(f"  Confusion Matrix:\n{confusion_matrix(y2_te, p2)}")
print(f"  Report:\n{classification_report(y2_te, p2, target_names=['No-Show','Attend'])}")

joblib.dump(m2, 'no_show_prediction_model.pkl')
print("  Saved → no_show_prediction_model.pkl")

sample2 = pd.DataFrame([{
    'event_type':'Sports','mode':'Offline','department':'Marketing',
    'day_of_week':'Saturday','weather':'Clear',
    'registrations':150,'is_weekend':1,'duration_hours':3.0,
    'speaker_rating':4.2,'reminder_sent':1,
    'past_attendance_rate':0.65,'ticket_price':10.0,'location_capacity':200
}])
label2 = "Attend" if m2.predict(sample2)[0] == 1 else "Not Attend"
prob2  = round(float(m2.predict_proba(sample2)[0][1]), 4)
print(f"  Sample → {label2} (prob: {prob2})")

# ══════════════════════════════════════════════════════════════
# MODEL 3: USER ATTENDANCE PREDICTION (Classification)
# ══════════════════════════════════════════════════════════════
print("\n[MODEL 3] User Attendance Prediction — RandomForestClassifier")
print("-" * 60)

df_u = pd.read_csv('user_event_dataset.csv')
print(f"  Rows: {len(df_u):,}")
print(f"  Class balance: {df_u['attended'].value_counts().to_dict()}")

CAT3 = ['event_type', 'mode', 'department', 'day_of_week']
NUM3 = ['past_user_attendance_rate', 'days_before_registration',
        'reminder_sent', 'is_weekend']

X3 = df_u[CAT3 + NUM3]
y3 = df_u['attended']

X3_tr, X3_te, y3_tr, y3_te = train_test_split(X3, y3, test_size=0.2, random_state=42)

pre3 = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT3),
    ('num', 'passthrough', NUM3)
])

m3 = Pipeline([('pre', pre3),
               ('clf', RandomForestClassifier(n_estimators=100, max_depth=10,
                                              random_state=42, n_jobs=-1))])
print("  Training...")
m3.fit(X3_tr, y3_tr)
p3 = m3.predict(X3_te)

print(f"  Accuracy : {accuracy_score(y3_te, p3):.4f}")
print(f"  Report:\n{classification_report(y3_te, p3, target_names=['Not Attend','Attend'])}")

joblib.dump(m3, 'user_attendance_model.pkl')
print("  Saved → user_attendance_model.pkl")

sample3 = pd.DataFrame([{
    'event_type':'Cultural','mode':'Online','department':'HR',
    'day_of_week':'Sunday',
    'past_user_attendance_rate':0.80,
    'days_before_registration':3,
    'reminder_sent':1,
    'is_weekend':1
}])
prob3 = round(float(m3.predict_proba(sample3)[0][1]), 4)
print(f"  Sample → probability: {prob3}")

print("\n" + "=" * 60)
print("  ALL 3 MODELS SAVED SUCCESSFULLY")
print("=" * 60)
