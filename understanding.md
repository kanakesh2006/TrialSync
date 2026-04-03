# TrialSync - Project Understanding

## 1. Project Overview

**TrialSync** is an AI-powered, dual-sided platform designed to solve the problem of clinical trial discovery. It bridges the gap between patients looking for experimental treatments and researchers looking for qualified subsets of patients. 

Instead of relying solely on exact keyword matches which often fail due to complex medical terminology, BioMatch utilizes a hybrid approach. It uses **Semantic Search** (Vector AI) to grasp the core meaning of a patient's medical summary and match it against the abstracts and criteria of clinical trials, coupled with **Hard Filters** (age, sex, etc.) and direct keyword boosting for explicit drug/condition matches. 

The platform supports interactions for three roles: Patients, Researchers, and Doctors, giving patients a direct line of communication to the individuals running the trials they match with.

---

## 2. Architecture Explanation

The project follows a modern web architecture divided logically into frontend, backend, and embedded AI microservices:

*   **Frontend (React 19 + TypeScript + Vite + Tailwind CSS):**
    *   Provides specialized dashboards for Patients, Researchers, and Doctors.
    *   Uses Clerk for robust authentication and role management.
    *   Interfaces like the `Patient_Chatbot` allow users to intuitively supply their medical symptoms rather than filling out complex forms.
*   **Backend (FastAPI + Python):**
    *   Acts as the central API gateway and handles core business logic, webhooks, matching algorithms, and user/study CRUD (Create, Read, Update, Delete) operations.
    *   **Database:** PostgreSQL augmented with the **pgvector** extension. This allows storing high-dimensional embeddings directly alongside tabulated data, enabling rapid in-database semantic searches. SQLAlchemy is used as the ORM.
*   **AI Microservices (Anamnesis / Chatbots):**
    *   A dedicated module (`src/backend/microservices/anaminesis`) acts as an intelligent medical scribe. 
    *   It uses Google GenAI + Google ADK to facilitate multi-turn, goal-oriented conversations with patients (or parse their medical PDFs) and condense raw dialogue/text into structured `PatientStatus` reports (conditions, drugs, summarized history).

---

## 3. End-to-End Data Flow

Here is how data enters, processes, and produces matches:

1.  **Data Ingestion (Clinical Trials):**
    *   Clinical trial information is parsed (likely from ClinicalTrials.gov API) into `ResearchStudy` database entries.
    *   During this ingestion, a 384-dimensional vector embedding of the study's scope/criteria is generated and stored in a pgvector column (`study_embedding`).
2.  **Data Ingestion (Patients):**
    *   A patient signs up and interacts with the **Anamnesis Chatbot** or uploads a medical record PDF.
    *   The LLM agent collects symptoms, medical history, age, and existing medications.
    *   The agent finalizes a structured `MedicalReport`.
    *   This structured data is combined into a patient summary paragraph and vectorized into a 384-dimensional embedding (`patient_vector_summary`), which is saved to the database.
3.  **Semantic Matching:**
    *   When a patient wants to view trial matches (via `/matching/patient/{clerk_id}`), the backend retrieves their `patient_vector_summary`.
    *   **Hard SQL Filtering:** The database evaluates strict criteria. For example, trials are filtered tightly by patient `age`, `sex`, and the trial's `RECRUITING` status.
    *   **Vector Similarity Search:** For the trials that pass the hard filters, pgvector calculates the cosine distance between the patient's vector and each study's vector directly during the SQL query.
4.  **Ranking and Scoring:**
    *   Trials returned from the database are graded by an algorithm (`_compute_score` in `matching.py`). 
    *   The score maps the raw _cosine similarity_ into a baseline point value.
    *   It then applies **bonuses** for explicit entity overlap (matching precise normalized strings of `conditions` or `drugs` between the patient and the trial). 
5.  **Output:** 
    *   The top-scoring studies (up to 10) are returned via the API.
    *   The React frontend paints these results on the Patient Dashboard, empowering them to message the researchers natively.

---

## 4. Key Files and Their Purpose

### Backend
*   **`src/backend/app/main.py`:** The backend entry point. Wires up FastAPI, CORS, initializes the database, and includes all the primary API route handlers.
*   **`src/backend/app/models.py`:** Database Schema mappings. Features tables like `User`, `ResearchStudy`, and `PatientStatus`. Notably contains the `Vector(384)` configurations needed for pgvector.
*   **`src/backend/app/api/matching.py`:** The core engine for connecting people to trials. Orchestrates the hybrid search (hard SQL filters + vector arithmetic) and applies custom ranking equations.
*   **`src/backend/microservices/anaminesis/api.py`:** Secondary FastAPI app dedicated to AI logic. Runs the Ephemeral RAG/Chat agent that safely processes user context until a final clinical "MedicalReport" is ready for the core backend.
*   **`init.sql` (Root):** Initializes the PostgreSQL DB, explicitly enables the `vector` extension, and sets up indexing types like `ivfflat` to make similarity lookups vastly faster at scale.

### Frontend
*   **`src/frontend/src/App.tsx` & `main.tsx`:** React initialization, providers (Clerk), and router setups.
*   **`src/frontend/src/app/pages/Patient_Chatbot.tsx`:** The conversational UI where Patients answer back-and-forth LLM questions to populate their health metadata.
*   **`src/frontend/src/app/pages/Dashboard.tsx`:** The centralized hub where user information, matching trials, or applicant lists are displayed based on role.

---

## 5. AI / ML Pipeline Explanation

The AI is implemented via a two-step "Extract & Embed" strategy:

*   **Extraction Model (Google GenAI):** Used strictly to map unstructured data to structured data. The `AnamnesisAgent` relies on Generative AI prompts to figure out what data is missing (e.g., "Determine duration of symptoms") and holds a dialogue until it can accurately emit a JSON payload depicting exactly what's wrong with the patient (`MedicalReport`).
*   **Embedding Model (Sentence Transformers):** The project operates on standard 384-dimensional vectors. This heavily implies the use of a model like `all-MiniLM-L6-v2` run locally via `sentence-transformers` (mentioned in `requirements.txt`). Both clinical trial text and patient summary texts run through this model to create arrays of coordinates.
*   **Similarity Computation (pgvector):** By storing embeddings in `POSTGRES`, the application compares meanings mathematically. It uses the `vector_cosine_ops` index over the embeddings, executing a query (`cosine_distance()`) that compares the angle between the patient's condition-vector and the trial's requirement-vector. Shorter distances map to higher programmatic similarity.
