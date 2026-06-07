from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from mcp.bigquery import save_report
import google.generativeai as genai
import shutil
import os

from mcp.pdf_reader import read_pdf
from mcp.vector_db import add_doc, search
from agents.risk_agent import assess_risk
from agents.report_agent import generate_report

load_dotenv()

genai.configure(
    api_key=os.getenv("GOOGLE_API_KEY")
)

m = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_txt = ""


@app.get("/")
def home():
    return {
        "message": "Compliance Analyzer API Running"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    global latest_txt

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    fp = f"uploads/{file.filename}"

    try:
        with open(fp, "wb") as b:
            shutil.copyfileobj(file.file, b)

        latest_txt = read_pdf(fp)
        
        # Verify the file is not empty/unreadable
        if not latest_txt or not latest_txt.strip():
            raise ValueError("The uploaded file does not contain any readable text. Please make sure it is a valid PDF document with text content.")

        add_doc(latest_txt)

    except Exception as e:
        # Clean up the file if it was created
        if os.path.exists(fp):
            try:
                os.remove(fp)
            except Exception:
                pass
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process PDF: {str(e)}"
        )

    return {
        "message": "File uploaded and indexed successfully",
        "file": file.filename
    }


@app.post("/chat")
async def chat(q: str):

    ctx = search(q)

    p = f"""
Answer the question using only the provided context.

Context:
{ctx}

Question:
{q}
"""

    r = m.generate_content(p)

    return {
        "question": q,
        "answer": r.text
    }


@app.get("/report")
def report():

    global latest_txt

    if not latest_txt:
        return {
            "message": "No document uploaded"
        }

    r = assess_risk(latest_txt)

    rep = generate_report(r)

    saved = save_report(
        r["score"],
        r["gaps"],
        rep
    )

    return {
        "risk_score": r["score"],
        "gaps": r["gaps"],
        "report": rep,
        "bigquery_saved": saved
    }


@app.get("/dashboard")
def dashboard():

    global latest_txt

    if not latest_txt:
        return {
            "documents": 0,
            "risk_score": 0,
            "gaps": 0
        }

    r = assess_risk(latest_txt)

    return {
        "documents": 1,
        "risk_score": r["score"],
        "gaps": len(r["gaps"])
    }


@app.get("/dashboard-ui", response_class=HTMLResponse)
def dashboard_ui():

    global latest_txt

    if not latest_txt:
        return """
        <html>
        <body>
            <h1>No document uploaded</h1>
        </body>
        </html>
        """

    r = assess_risk(latest_txt)

    g = "".join([f"<li>{x}</li>" for x in r["gaps"]])

    return f"""
    <html>
    <head>
        <title>Compliance Dashboard</title>
    </head>

    <body style="font-family:Arial;padding:30px">

        <h1>Compliance Dashboard</h1>

        <hr>

        <h2>Documents Uploaded</h2>
        <h3>1</h3>

        <h2>Risk Score</h2>
        <h3>{r['score']}%</h3>

        <progress value="{r['score']}" max="100" style="width:400px;height:30px"></progress>

        <h2>Compliance Gaps</h2>

        <ul>
            {g}
        </ul>

    </body>
    </html>
    """


app.mount("/frontend", StaticFiles(directory="frontend/dist", html=True), name="frontend")