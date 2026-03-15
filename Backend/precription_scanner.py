import os
import json
import warnings
import logging
import time
import base64
import mimetypes

# Suppress noisy warnings from torch/easyocr
warnings.filterwarnings("ignore")
logging.getLogger("easyocr").setLevel(logging.ERROR)

from dotenv import load_dotenv
load_dotenv()

from google import genai
import easyocr
import langextract as lx
import langextract.data as lx_data

# ── API clients ─────────────────────────────────────────────────────
os.environ["LANGEXTRACT_API_KEY"] = os.getenv("GEMINI_API_KEY", "")
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ── Supported image extensions ──────────────────────────────────────
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif", ".tiff", ".tif"}

def is_image_file(path: str) -> bool:
    _, ext = os.path.splitext(path)
    return ext.lower() in IMAGE_EXTENSIONS

# ── OCR: extract text from image locally ────────────────────────────
print("Loading OCR engine (first run downloads model ~100 MB)...")
reader = easyocr.Reader(["en"], gpu=False, verbose=False)

def ocr_image(file_path: str) -> str:
    """Use EasyOCR to extract text from a prescription image locally."""
    results = reader.readtext(file_path, detail=0, paragraph=True)
    return "\n".join(results)

# ── Gemini Vision prompt ────────────────────────────────────────────
GEMINI_VISION_PROMPT = """You are a prescription reader. Analyze the provided prescription 
image and extract ALL medication details in this exact JSON format:

{
  "doctor_name":  "...",
  "patient_name": "...",
  "diagnosis":    "...",
  "medications": [
    {
      "name":      "...",
      "dose_mg":   "...",
      "dose_unit": "mg",
      "frequency": "...",
      "timing":    "...",
      "duration":  "..."
    }
  ]
}

Rules:
- Return ONLY the JSON, no markdown fences, no extra text.
- If a field is unreadable or missing, use "N/A".
- dose_mg should be a number string like "500".
- Read every medication listed, even if handwriting is unclear — make your best guess.
"""

# ── LangExtract prompt + examples ───────────────────────────────────
LX_PROMPT = """Extract all prescription details from this medical text.
Find every medication with its dose, frequency, timing instructions,
and duration. Also extract doctor name, patient name, and diagnosis."""

LX_EXAMPLES = [
    lx_data.ExampleData(
        text="""Dr. Rahul Sharma, MBBS
Patient: Amit Patel, Age 45
Date: 14/03/2026
Diagnosis: Type 2 Diabetes

1. Metformin 500mg - twice daily with meals (morning and evening)
   Duration: 3 months
2. Atorvastatin 10mg - once daily at bedtime
   Duration: ongoing
3. Ramipril 5mg - once daily at night
   Duration: 3 months""",

        extractions=[{
            "doctor_name":  "Dr. Rahul Sharma",
            "patient_name": "Amit Patel",
            "diagnosis":    "Type 2 Diabetes",
            "medications": [
                {
                    "name":      "Metformin",
                    "dose_mg":   "500",
                    "dose_unit": "mg",
                    "frequency": "twice daily",
                    "timing":    "with meals morning and evening",
                    "duration":  "3 months"
                },
                {
                    "name":      "Atorvastatin",
                    "dose_mg":   "10",
                    "dose_unit": "mg",
                    "frequency": "once daily",
                    "timing":    "bedtime",
                    "duration":  "ongoing"
                },
                {
                    "name":      "Ramipril",
                    "dose_mg":   "5",
                    "dose_unit": "mg",
                    "frequency": "once daily",
                    "timing":    "night",
                    "duration":  "3 months"
                }
            ]
        }]
    )
]

# ══════════════════════════════════════════════════════════════════════
#  MODE 1 — Gemini Vision (best for handwritten / photo prescriptions)
# ══════════════════════════════════════════════════════════════════════
def scan_with_gemini_vision(file_path: str) -> dict:
    file_path = file_path.strip().strip('"').strip("'")

    if not os.path.exists(file_path):
        print(f"  Error: File not found — {file_path}")
        return {}

    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "image/jpeg"

    with open(file_path, "rb") as f:
        image_bytes = f.read()
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    contents = [{
        "parts": [
            {"text": GEMINI_VISION_PROMPT},
            {"inline_data": {"mime_type": mime_type, "data": image_b64}},
        ]
    }]

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash", contents=contents,
            )
            break
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "retryDelay" in err:
                wait = 40
                print(f"  ⏳ Rate limited. Waiting {wait}s before retry ({attempt}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"  Error: {e}")
                return {}
    else:
        print("  ❌ Failed after 3 retries. Try again in a few minutes.")
        return {}

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print("  Warning: Could not parse Gemini response.")
        print(f"  Raw: {raw[:200]}...")
        return {"doctor_name": "N/A", "patient_name": "N/A", "diagnosis": "N/A", "medications": []}

# ══════════════════════════════════════════════════════════════════════
#  MODE 2 — Local OCR + LangExtract (works offline for OCR step)
# ══════════════════════════════════════════════════════════════════════
def scan_with_ocr(file_path: str) -> dict:
    file_path = file_path.strip().strip('"').strip("'")

    if not os.path.exists(file_path):
        print(f"  Error: File not found — {file_path}")
        return {}

    if is_image_file(file_path):
        print("  Step 1/2: Running local OCR on image...")
        text = ocr_image(file_path)
        if not text.strip():
            print("  Warning: OCR could not read any text from the image.")
            return {"doctor_name": "N/A", "patient_name": "N/A", "diagnosis": "N/A", "medications": []}
        print(f"  OCR extracted {len(text)} characters.")
        print(f"\n  --- OCR Output Preview ---")
        for line in text[:300].split("\n"):
            print(f"  {line}")
        print(f"  -------------------------\n")
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        print(f"  Step 1/2: Read {len(text)} characters from text file.")

    print("  Step 2/2: Parsing with LangExtract + Gemini...")

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            result = lx.extract(
                text_or_documents=text,
                prompt_description=LX_PROMPT,
                examples=LX_EXAMPLES,
                model_id="gemini-2.0-flash",
            )
            break
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "retryDelay" in err:
                wait = 40
                print(f"  ⏳ Rate limited. Waiting {wait}s before retry ({attempt}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"  Error: {e}")
                return {"doctor_name": "N/A", "patient_name": "N/A",
                        "diagnosis": "N/A", "medications": [], "raw_ocr_text": text}
    else:
        print("  ❌ Failed after 3 retries. Returning raw OCR text only.")
        return {"doctor_name": "N/A", "patient_name": "N/A",
                "diagnosis": "N/A", "medications": [], "raw_ocr_text": text}

    if hasattr(result, "extractions") and result.extractions:
        extracted = result.extractions[0] if isinstance(result.extractions, list) else result.extractions
        if not isinstance(extracted, dict) and hasattr(extracted, "__dict__"):
            extracted = vars(extracted)
        elif not isinstance(extracted, dict):
            extracted = {}
    elif hasattr(result, "extracted"):
        extracted = result.extracted if isinstance(result.extracted, dict) else {}
    else:
        extracted = {}

    return {
        "doctor_name":  extracted.get("doctor_name",  "N/A"),
        "patient_name": extracted.get("patient_name", "N/A"),
        "diagnosis":    extracted.get("diagnosis",    "N/A"),
        "medications":  extracted.get("medications",  []),
        "raw_ocr_text": text,
    }

# ── Convert to ChronoRx format ──────────────────────────────────────
def extract_for_chronorx(prescription: dict) -> list:
    def safe_float(val):
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    return [
        {
            "name":      med.get("name",      "Unknown"),
            "dose_mg":   safe_float(med.get("dose_mg")),
            "frequency": med.get("frequency", "once daily"),
            "timing":    med.get("timing",    "not specified"),
            "duration":  med.get("duration",  "ongoing"),
        }
        for med in prescription.get("medications", [])
    ]

# ── Run ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import tkinter as tk
    from tkinter import filedialog

    print("\n-- ChronoRx Prescription Scanner --------------------------")
    print("  Supported: JPG, PNG, BMP, WEBP, GIF, TIFF, TXT")
    print("-----------------------------------------------------------")
    print("\n  Choose scan mode:")
    print("    1 — Gemini Vision (best for handwritten prescriptions)")
    print("    2 — Local OCR (no API needed for image reading)")
    mode = input("\n  Enter 1 or 2: ").strip()

    # Open file picker dialog
    print("\n  Opening file picker... select your prescription image.")
    root = tk.Tk()
    root.withdraw()  # hide the main tkinter window
    root.attributes("-topmost", True)  # bring dialog to front

    file_path = filedialog.askopenfilename(
        title="Select Prescription Image or Text File",
        filetypes=[
            ("Image files", "*.jpg *.jpeg *.png *.bmp *.webp *.gif *.tiff *.tif"),
            ("Text files", "*.txt"),
            ("All files", "*.*"),
        ],
    )
    root.destroy()

    if not file_path:
        print("  No file selected. Exiting.")
        exit(1)

    print(f"  Selected: {file_path}")
    print("\nScanning prescription...\n")

    if mode == "1":
        prescription = scan_with_gemini_vision(file_path)
    else:
        prescription = scan_with_ocr(file_path)

    if not prescription:
        print("Extraction failed.")
        exit(1)

    print(f"\n  Doctor   : {prescription.get('doctor_name', 'N/A')}")
    print(f"  Patient  : {prescription.get('patient_name', 'N/A')}")
    print(f"  Diagnosis: {prescription.get('diagnosis', 'N/A')}")
    print("\n  Medications:")

    meds = extract_for_chronorx(prescription)
    if meds:
        for m in meds:
            print(f"    -> {m['name']} {m['dose_mg']}mg | {m['frequency']} | {m['timing']}")
    else:
        print("    (no medications extracted)")

    with open("scanned_prescription.json", "w") as f:
        json.dump(prescription, f, indent=2)
    print("\n✅ Saved to scanned_prescription.json")