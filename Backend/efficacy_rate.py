import math
import requests

def get_sunrise_hour(lat: float, lon: float) -> float:
    url = f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&formatted=0"
    data = requests.get(url).json()
    from datetime import datetime
    dt = datetime.fromisoformat(data["results"]["sunrise"])
    return dt.hour + dt.minute / 60

def calculate_efficacy(medication: str, dose_mg: float, admin_hour: float, lat: float, lon: float) -> dict:
    
    DRUG_OPTIMAL = {
        "Metformin":    {"optimal": 18, "halflife": 6.2,  "bioavail": 0.55},
        "Atorvastatin": {"optimal": 22, "halflife": 14.0, "bioavail": 0.12},
        "Ramipril":     {"optimal": 22, "halflife": 13.0, "bioavail": 0.28},
        "Sertraline":   {"optimal": 8,  "halflife": 26.0, "bioavail": 0.44},
        "Amlodipine":   {"optimal": 22, "halflife": 40.0, "bioavail": 0.64},
    }

    # Step 1 — get sunrise and wake time from GPS
    sunrise    = get_sunrise_hour(lat, lon)
    wake_hour  = sunrise + 0.5

    # Step 2 — body temperature sine wave at admin hour
    hours_since_wake = (admin_hour - wake_hour) % 24
    core_temp = 36.1 + 0.65 * math.sin(2 * math.pi * (hours_since_wake - 11) / 24)

    # Step 3 — CYP450 enzyme activity from temperature
    enzyme = 1.0 + 0.10 * (core_temp - 36.1)

    # Step 4 — timing match: how close to drug's optimal window
    drug        = DRUG_OPTIMAL.get(medication, {"optimal": 8, "halflife": 12, "bioavail": 0.5})
    deviation   = min(abs(admin_hour - drug["optimal"]), 24 - abs(admin_hour - drug["optimal"]))
    timing_match = max(0.4, 1.0 - (deviation / 12.0) * 0.6)

    # Step 5 — final efficacy score
    efficacy       = round(enzyme * timing_match * 100, 1)
    effective_dose = round(dose_mg * enzyme * timing_match, 1)

    # Step 6 — optimal comparison
    optimal_wake    = (drug["optimal"] - wake_hour) % 24
    optimal_temp    = 36.1 + 0.65 * math.sin(2 * math.pi * (optimal_wake - 11) / 24)
    optimal_enzyme  = 1.0 + 0.10 * (optimal_temp - 36.1)
    optimal_efficacy = round(optimal_enzyme * 100, 1)
    loss             = round(optimal_efficacy - efficacy, 1)

    return {
        "medication":       medication,
        "dose_mg":          dose_mg,
        "admin_time":       f"{int(admin_hour):02d}:00",
        "sunrise":          f"{int(sunrise):02d}:{int((sunrise % 1)*60):02d}",
        "core_temp":        f"{core_temp:.2f}°C",
        "enzyme_activity":  f"{enzyme:.3f}x",
        "efficacy_score":   f"{efficacy}%",
        "effective_dose":   f"{effective_dose}mg",
        "optimal_time":     f"{drug['optimal']:02d}:00",
        "optimal_efficacy": f"{optimal_efficacy}%",
        "efficacy_lost":    f"{loss}%",
        "recommendation":   f"Move {medication} to {drug['optimal']:02d}:00 to recover {loss}% efficacy"
    }

# ── Run ─────────────────────────────────────────────────────────────
result = calculate_efficacy(
    medication="Metformin",
    dose_mg=500,
    admin_hour=8,
    lat=19.076,   # Mumbai
    lon=72.877
)
for k, v in result.items():
    print(f"{k:20s}: {v}")