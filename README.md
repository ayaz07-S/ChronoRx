# ChronoRx Clinic App

A clinical decision support application designed to provide advanced pharmacokinetic simulations, biological chronotype profiling, and personalized care recommendations for doctors and patients. 

## Structure

- **/Frontend**: React + TypeScript + Vite application containing the Doctor Portal, Patient interfaces, and visual timelines for medication efficacy.
- **/Backend**: FastAPI service powering the logic including LLM insights (Langchain/OpenAI), document parsing (`precription_scanner.py`), and recommendation endpoints.

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your environment variables by creating a `.env` file (see `.env.example` if applicable).
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

## Features
- **Pharmacokinetic Simulator**
- **Biological Profile & Chronotype Quiz**
- **Missed Dose Rescue** (powered by LLM)
- **Efficacy Ranker**
- **Enzyme Timeline Integration**
