from dotenv import load_dotenv
import os
import google.generativeai as genai

from mcp.pdf_reader import read_pdf
from mcp.vector_db import add_doc, search
from agents.risk_agent import assess_risk
from agents.report_agent import generate_report

load_dotenv()

genai.configure(
    api_key=os.getenv("GOOGLE_API_KEY")
)

m = genai.GenerativeModel("gemini-2.5-flash")

txt = read_pdf("sample.pdf")

add_doc(txt)

q = input("Ask Question: ")

ctx = search(q)

p = f"""
Answer the question using only the context below.

Context:
{ctx}

Question:
{q}
"""

r = m.generate_content(p)

print("\nAnswer:")
print(r.text)

risk = assess_risk(txt)

print("\n")
print(generate_report(risk))