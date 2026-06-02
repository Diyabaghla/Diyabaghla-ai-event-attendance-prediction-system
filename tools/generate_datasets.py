import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

random.seed(42)
np.random.seed(42)

EVENT_TYPES  = ['Conference', 'Workshop', 'Seminar', 'Webinar', 'Meetup',
                'Training', 'Summit', 'Sports', 'Cultural']
MODES        = ['Online', 'Offline', 'Hybrid']
DEPARTMENTS  = ['Engineering', 'Marketing', 'HR', 'Sales',
                'Finance', 'Operations', 'Design', 'Leadership']
DAYS         = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
                'Friday', 'Saturday', 'Sunday']
WEATHER      = ['Clear', 'Cloudy', 'Rainy', 'Snowy', 'Stormy']

def generate_event_dataset(n=30000):
    data = []
    start_date = datetime(2022, 1, 1)
    for i in range(1, n + 1):
        event_type     = random.choice(EVENT_TYPES)
        mode           = random.choice(MODES)
        department     = random.choice(DEPARTMENTS)
        registrations  = random.randint(20, 600)
        event_date     = start_date + timedelta(days=random.randint(0, 900))
        day_of_week    = event_date.strftime('%A')
        is_weekend     = 1 if day_of_week in ['Saturday', 'Sunday'] else 0
        duration       = round(random.uniform(0.5, 8.0), 1)
        speaker_rating = round(random.uniform(1.0, 5.0), 1)
        reminder_sent  = random.randint(0, 1)
        past_rate      = round(random.uniform(0.3, 1.0), 2)
        weather        = random.choice(WEATHER)
        ticket_price   = round(random.uniform(0, 200), 2)
        capacity       = random.randint(30, 800)

        base_rate = past_rate
        if event_type.lower() in ['webinar']:
            base_rate += 0.10
        if event_type.lower() in ['sports', 'cultural']:
            base_rate += 0.15
        if is_weekend:
            base_rate += 0.10
        if reminder_sent:
            base_rate += 0.05
        if speaker_rating > 4:
            base_rate += 0.05
        if weather.lower() == 'rainy':
            base_rate -= 0.10

        base_rate  = min(base_rate, 0.95)
        attendance = int(registrations * base_rate)
        if mode.lower() == 'offline':
            attendance = min(attendance, capacity)
        noise      = random.randint(-5, 5)
        attendance = max(1, attendance + noise)

        data.append([i, f"Event_{i}", event_type, mode, department,
                     registrations, event_date.strftime('%Y-%m-%d'),
                     day_of_week, is_weekend, duration, speaker_rating,
                     reminder_sent, past_rate, weather, ticket_price,
                     capacity, attendance])

    cols = ['event_id','event_name','event_type','mode','department',
            'registrations','event_date','day_of_week','is_weekend',
            'duration_hours','speaker_rating','reminder_sent',
            'past_attendance_rate','weather','ticket_price',
            'location_capacity','actual_attendance']
    return pd.DataFrame(data, columns=cols)

def generate_user_dataset(n=40000):
    data = []
    start_date = datetime(2022, 1, 1)
    for i in range(1, n + 1):
        event_type  = random.choice(EVENT_TYPES)
        mode        = random.choice(MODES)
        department  = random.choice(DEPARTMENTS)
        past_rate   = round(random.uniform(0.1, 1.0), 2)
        days_before = random.randint(0, 60)
        reminder    = random.randint(0, 1)
        event_date  = start_date + timedelta(days=random.randint(0, 900))
        day_of_week = event_date.strftime('%A')
        is_weekend  = 1 if day_of_week in ['Saturday', 'Sunday'] else 0

        prob = past_rate
        if event_type.lower() in ['webinar']:
            prob += 0.10
        if event_type.lower() in ['sports', 'cultural']:
            prob += 0.15
        if is_weekend:
            prob += 0.10
        if reminder:
            prob += 0.05
        if days_before <= 7:
            prob += 0.05
        if days_before > 30:
            prob -= 0.05
        prob = min(max(prob, 0.05), 0.95)
        attended = 1 if random.random() < prob else 0

        data.append([i, event_type, mode, department, past_rate,
                     days_before, reminder, day_of_week, is_weekend, attended])

    cols = ['user_id','event_type','mode','department',
            'past_user_attendance_rate','days_before_registration',
            'reminder_sent','day_of_week','is_weekend','attended']
    return pd.DataFrame(data, columns=cols)

if __name__ == '__main__':
    print("Generating event dataset (30,000 rows)...")
    event_df = generate_event_dataset(30000)
    event_df.to_csv('event_dataset.csv', index=False)
    print(f"  Saved event_dataset.csv")
    print(f"  Avg attendance rate: {(event_df['actual_attendance']/event_df['registrations']).mean():.2%}")

    print("Generating user dataset (40,000 rows)...")
    user_df = generate_user_dataset(40000)
    user_df.to_csv('user_event_dataset.csv', index=False)
    print(f"  Saved user_event_dataset.csv")
    print(f"  Attended: {user_df['attended'].sum():,}/{len(user_df):,} ({user_df['attended'].mean():.1%})")
    print("Done.")
