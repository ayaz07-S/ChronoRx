import os
import math
import json
import logging
import warnings

os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
warnings.filterwarnings("ignore")
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)

from dotenv import load_dotenv
load_dotenv()

import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import tempfile
import precription_scanner as scanner

from openai import OpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

# ── App ─────────────────────────────────────────────────────────────
app = FastAPI(title="ChronoRx API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Featherless AI ──────────────────────────────────────────────────
llm_client = OpenAI(
    api_key=os.getenv("FEATHERLESS_API_KEY"),
    base_url="https://api.featherless.ai/v1"
)

# ── RAG — ChromaDB ──────────────────────────────────────────────────
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

RAG_FILES = [
    "src/data/Diabetes.json",
    "src/data/thyrooid.json",
    "src/data/hypertension.json",
    "src/data/anxiety_depression.json"
]

def load_documents():
    documents = []
    for file in RAG_FILES:
        if not os.path.exists(file):
            continue
        with open(file) as f:
            data = json.load(f)
        for med in data.get("medications", []):
            content = f"""
Disease: {data['disease']}
Medication: {med['name']}
Class: {med['class']}
Optimal timing: {med['optimal_timing']}
Avoid timing: {med['avoid_timing']}
Circadian rationale: {med['circadian_rationale']}
Missed dose logic: {med['missed_dose_logic']}
Chronotype adjustments: {json.dumps(med.get('chronotype_adjustments', {}))}
Clinical trials: {json.dumps(med.get('clinical_trials', []))}
            """.strip()
            documents.append(Document(
                page_content=content,
                metadata={"disease": data["disease"], "medication": med["name"]}
            ))
    return documents

if os.path.exists("./chroma_db") and os.listdir("./chroma_db"):
    vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
else:
    vectorstore = Chroma.from_documents(
        documents=load_documents(), embedding=embeddings, persist_directory="./chroma_db"
    )

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

SYSTEM_PROMPT = """You are ChronoRx Assistant, an expert AI built into the ChronoRx 
Circadian Medication Operating System. You have deep knowledge of chronobiology, 
pharmacokinetics, circadian rhythms, and medication scheduling.
You never diagnose or prescribe. Always recommend contacting a doctor for dose changes.
Cite clinical trials simply. Never use jargon without explaining it immediately."""

# ── Drug optimal data ───────────────────────────────────────────────
DRUG_OPTIMAL = {
    "Metformin":    {"optimal": 18, "halflife": 6.2,  "bioavail": 0.55},
    "Atorvastatin": {"optimal": 22, "halflife": 14.0, "bioavail": 0.12},
    "Ramipril":     {"optimal": 22, "halflife": 13.0, "bioavail": 0.28},
    "Sertraline":   {"optimal": 8,  "halflife": 26.0, "bioavail": 0.44},
    "Amlodipine":   {"optimal": 22, "halflife": 40.0, "bioavail": 0.64},
    "Levothyroxine":{"optimal": 22, "halflife": 168,  "bioavail": 0.80},
}

# ── Helper: sunrise from GPS ────────────────────────────────────────
def get_sunrise_hour(lat: float, lon: float) -> float:
    url = f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&formatted=0"
    data = requests.get(url, timeout=5).json()
    dt = datetime.fromisoformat(data["results"]["sunrise"])
    return dt.hour + dt.minute / 60

# ── Helper: chronotype from sleep/wake ─────────────────────────────
def time_to_hours(t: str) -> float:
    h, m = map(int, t.strip().split(":"))
    return h + m / 60

def identify_chronotype(sleep_time: str, wake_time: str) -> str:
    s = time_to_hours(sleep_time)
    w = time_to_hours(wake_time)
    if w < s:
        w += 24
    duration = w - s
    midpoint  = ((s + w) / 2) % 24
    if duration < 6.5:
        return "Dolphin"
    elif midpoint < 2.5:
        return "Lion"
    elif midpoint < 3.5:
        return "Bear"
    else:
        return "Wolf"

# ── Helper: efficacy calculation ────────────────────────────────────
def calculate_efficacy(medication: str, dose_mg: float, admin_hour: float,
                        lat: float, lon: float) -> dict:
    sunrise   = get_sunrise_hour(lat, lon)
    wake_hour = sunrise + 0.5
    hours_since_wake = (admin_hour - wake_hour) % 24
    core_temp = 36.1 + 0.65 * math.sin(2 * math.pi * (hours_since_wake - 11) / 24)
    enzyme    = 1.0 + 0.10 * (core_temp - 36.1)
    drug      = DRUG_OPTIMAL.get(medication, {"optimal": 8, "halflife": 12, "bioavail": 0.5})
    deviation = min(abs(admin_hour - drug["optimal"]), 24 - abs(admin_hour - drug["optimal"]))
    timing_match   = max(0.4, 1.0 - (deviation / 12.0) * 0.6)
    efficacy       = round(enzyme * timing_match * 100, 1)
    effective_dose = round(dose_mg * enzyme * timing_match, 1)
    opt_wake   = (drug["optimal"] - wake_hour) % 24
    opt_temp   = 36.1 + 0.65 * math.sin(2 * math.pi * (opt_wake - 11) / 24)
    opt_enzyme = 1.0 + 0.10 * (opt_temp - 36.1)
    optimal_eff= round(opt_enzyme * 100, 1)
    loss       = round(optimal_eff - efficacy, 1)
    return {
        "medication":       medication,
        "dose_mg":          dose_mg,
        "admin_time":       f"{int(admin_hour):02d}:00",
        "sunrise":          f"{int(sunrise):02d}:{int((sunrise % 1)*60):02d}",
        "core_temp":        f"{core_temp:.2f}C",
        "enzyme_activity":  f"{enzyme:.3f}x",
        "efficacy_score":   f"{efficacy}%",
        "effective_dose":   f"{effective_dose}mg",
        "optimal_time":     f"{drug['optimal']:02d}:00",
        "optimal_efficacy": f"{optimal_eff}%",
        "efficacy_lost":    f"{loss}%",
        "recommendation":   f"Move {medication} to {drug['optimal']:02d}:00 to recover {loss}% efficacy"
    }

# REQUEST MODELS
class ChatRequest(BaseModel):
    question:     str
    chronotype:   Optional[str] = "Bear"
    age_group:    Optional[str] = "adult"
    chrono_score: Optional[int] = 75
    medications:  Optional[list] = []

class ChronotypeRequest(BaseModel):
    sleep_time: str
    wake_time:  str

class EfficacyRequest(BaseModel):
    medication: str
    dose_mg:    float
    admin_hour: float
    lat:        float
    lon:        float

class MissedDoseRequest(BaseModel):
    medication: str
    chronotype: str
    age_group:  str
    hours_late: Optional[int] = 0

class ContactDoctorRequest(BaseModel):
    chronotype:   str
    age_group:    str
    chrono_score: int
    medications:  list
    trigger:      str

# ENDPOINTS

@app.get("/")
def root():
    return {"status": "ChronoRx API running", "version": "1.0"}

# 1 -- Chronotype
@app.post("/api/chronotype")
def get_chronotype(req: ChronotypeRequest):
    try:
        chronotype = identify_chronotype(req.sleep_time, req.wake_time)
        return {"chronotype": chronotype, "sleep_time": req.sleep_time, "wake_time": req.wake_time}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 2 -- Efficacy
@app.post("/api/efficacy")
def get_efficacy(req: EfficacyRequest):
    try:
        return calculate_efficacy(req.medication, req.dose_mg, req.admin_hour, req.lat, req.lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3 -- Chat
@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        docs = retriever.invoke(req.question)
        rag_context = "\n\n---\n\n".join([d.page_content for d in docs])
        user_message = f"""
USER PROFILE:
- Chronotype  : {req.chronotype}
- ChronoScore : {req.chrono_score}/100
- Age group   : {req.age_group}
- Medications : {', '.join([m.get('name','') for m in req.medications]) or 'None'}

RETRIEVED KNOWLEDGE:
{rag_context}

USER QUESTION: {req.question}
        """.strip()
        response = llm_client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message}
            ],
            temperature=0.3, max_tokens=512
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4 -- Missed dose
@app.post("/api/missed-dose")
def missed_dose(req: MissedDoseRequest):
    try:
        docs = retriever.invoke(f"missed dose {req.medication}")
        rag_context = "\n\n---\n\n".join([d.page_content for d in docs])
        prompt = f"""
A {req.age_group} patient with {req.chronotype} chronotype missed 
{req.medication} by {req.hours_late} hours.
Give: 1) take now or skip, 2) biological reason, 3) tomorrow adjustment.
RAG KNOWLEDGE: {rag_context}
        """.strip()
        response = llm_client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.2, max_tokens=300
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5 -- Contact doctor
@app.post("/api/contact-doctor")
def contact_doctor(req: ContactDoctorRequest):
    try:
        med_names = ', '.join([m.get('name', '') for m in req.medications])
        prompt = f"""Write a pre-filled doctor message for a {req.age_group} patient.
Chronotype: {req.chronotype} | ChronoScore: {req.chrono_score}/100
Medications: {med_names} | Trigger: {req.trigger}
3-4 sentences. Professional. Request medication timing review."""
        response = llm_client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.4, max_tokens=200
        )
        return {"message": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6 -- OCR Prescription Upload
@app.post("/api/scan-prescription")
async def scan_prescription(file: UploadFile = File(...)):
    try:
        # Save uploaded file to a temporary file
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
            
        try:
            prediction = scanner.scan_with_gemini_vision(temp_path)
            # if we didn't get any good result or it failed, fallback to mode 2
            if not prediction or not prediction.get("medications"):
                prediction = scanner.scan_with_ocr(temp_path)

            medications = scanner.extract_for_chronorx(prediction)
            
            return {
                "doctor_name": prediction.get("doctor_name", "N/A"),
                "patient_name": prediction.get("patient_name", "N/A"),
                "diagnosis": prediction.get("diagnosis", "N/A"),
                "medications": medications
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── Run ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)