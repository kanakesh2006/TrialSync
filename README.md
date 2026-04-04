# TrialSync

TrialSync connects patients to active clinical trials using AI. Upload a medical record, get a ranked list of trials you actually qualify for — with plain-language explanations of why each one is a match.

## The problem

Finding clinical trials is hard. ClinicalTrials.gov lists over 400,000 studies, with eligibility criteria written in dense medical language. Most patients never find the trials they qualify for. Most trials struggle to recruit.

## What TrialSync does

1. A patient is 
2. The patient's profile is matched against a corpus of active trials using semantic vector search — not just keyword matching.
3. Patients can message researchers directly through the platform.

## Matching pipeline

- **Hard filters** — age, sex, and recruitment status eliminate ineligible trials before any AI is involved.
- **Semantic search** — patient medical summaries are embedded and matched against pre-computed study vectors (`all-MiniLM-L6-v2`).

## Tech stack

| | |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Clerk |
| Backend | FastAPI, PostgreSQL + pgvector |
| AI | Google Gemini |

## Roles

**Patient** — upload a record, see matched trials ranked by relevance, message researchers.

**Researcher** — manage trials, view matched applicants, communicate with patients.

## Data source

Clinical trial data from [ClinicalTrials.gov](https://clinicaltrials.gov) API v2, covering 30+ disease areas including cancer, diabetes, Alzheimer's, cardiovascular disease, and more.

Perfect — here’s your **complete command sheet (copy-paste ready)** to run **database + backend + frontend** 🔥
Keep this as your **go-to setup checklist**.

---

# 🐳 **1. Run Database (PostgreSQL + pgvector via Docker)**

###  Start DB container:

```bash
docker run -d ^
  --name TrialSync-db ^
  -e POSTGRES_PASSWORD=postgres ^
  -p 5433:5432 ^
  ankane/pgvector
```

👉 (Use `\` instead of `^` if using Git Bash)

---

### ✅ Check if running:

```bash
docker ps
```

---

### ✅ Enable pgvector (ONLY FIRST TIME):

```bash
docker exec -it TrialSync-db psql -U postgres
```

Then inside:

```sql
CREATE EXTENSION vector;
```

---

# ⚙️ **2. Run Backend (FastAPI)**

###  Go to backend:

```bash
cd src/backend
```

---

###  Create virtual environment:

```bash
python -m venv venv
```

---

###  Activate:

**Windows:**

```bash
venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

---

###  Install dependencies:

```bash
pip install -r requirements.txt
```

---

###  Run backend:

```bash
uvicorn app.main:app --reload
```

---

### 🌐 Backend URL:

```text
http://localhost:8000
```

 Test:

```text
http://localhost:8000/docs
```

---

# 🌐 **3. Run Frontend (React + Vite)**

###  Open new terminal:

```bash
cd src/frontend
```

---

###  Install dependencies:

```bash
npm install
```

---

###  Run frontend:

```bash
npm run dev
```

---

### 🌐 Frontend URL:

```text
http://localhost:5173
```

---

# ⚠️ **IMPORTANT `.env` FILES**

---

##  Backend `.env`

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/postgres
GEMINI_API_KEY=your_key
CLERK_SECRET_KEY=your_key
FRONTEND_URL=http://localhost:5173
```

---

##  Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

---

# 🧠 **RUN ORDER (VERY IMPORTANT)**

```text
1. Start Docker DB
2. Run Backend
3. Run Frontend
```

---

#  **One-Line Summary**

```bash
# DB
docker run -d --name TrialSync-db -e POSTGRES_PASSWORD=postgres -p 5433:5432 ankane/pgvector

# Backend
cd src/backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd src/frontend
npm install
npm run dev
```

---


