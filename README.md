# <img src="./logo.svg" height="44" valign="middle" alt="VaultIQ Logo"> Compliance Analyzer

An AI-powered compliance document auditing and retrieval-augmented generation (RAG) assistant. VaultIQ ingests large enterprise policy documents (GDPR, HIPAA, SOC2, ISO27001) and enables risk analysis, semantic chat questions, and auto-generated compliance reports.

---

## 📸 Interface Preview

### Compliance Dashboard Overview
*Real-time compliance status, framework health, and active agent statuses.*

![VaultIQ Compliance Dashboard](screenshots\dashboard.png)

---

### Intelligent Document Upload Portal
*Drag-and-drop file ingestion queue backed by a step-by-step extraction pipeline.*

![Document Upload Portal](screenshots\upload.png)

---

### AI Compliance Chat Assistant
*Conversational interface querying vector databases with highlighting for detected gaps.*

![Compliance Chat Assistant](screenshots\chat.png)

---

### Risk Intelligence & Audit Reports
*Auto-generated compliance reports, optimal range posture gauges, and agent logs.*
![Risk Intelligence Reports](screenshots\reports.png)

---

## 🛠 Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Generative AI:** Google Gemini 2.5 Flash (`google-generativeai`)
- **PDF Extraction:** PyPDF2/PDF Parser (`mcp/pdf_reader.py`)
- **Knowledge Base:** Vector database index with cosine similarity search (`mcp/vector_db.py`)
- **Database Logs:** BigQuery database integration (`mcp/bigquery.py`)

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (loaded via CDN) & Custom CSS theme matching the Stitch design specifications.
- **Typography:** Sora (geometric headings), DM Sans (interface text), and DM Mono (numerical tables).
- **Icons:** Google Material Symbols.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Python (version 3.10+ recommended) and Node.js/npm installed on your machine.

### 1. Setup Environment Variables
Create a `.env` file in the root directory and add your Google API key:
```env
GOOGLE_API_KEY=your-api-key-here
```

### 2. Run the Backend Server
Navigate to the root directory, activate the python virtual environment, and launch FastAPI:
```bash
# 1. Navigate to the project folder
cd compliance_app

# 2. Activate the virtual environment
..\venv\Scripts\Activate.ps1

# 3. Start uvicorn
uvicorn main_api:app --reload
```
The API server will run at `http://127.0.0.1:8000`.

### 3. Open the Frontend
Once the backend is running, the compiled React app is served directly at:
```
http://127.0.0.1:8000/frontend/
```

### 4. Running Frontend in Dev Mode (Hot-Reloading)
To run Vite's hot-reloaded development server:
```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Run the dev server
npm run dev
```
Open `http://localhost:5173/` in your browser. All API requests are automatically proxied to port 8000.
