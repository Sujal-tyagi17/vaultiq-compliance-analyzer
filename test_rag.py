from dotenv import load_dotenv
import os

load_dotenv()

import google.generativeai as genai

from mcp.pdf_reader import read_pdf
from mcp.vector_db import add_doc, search

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("GOOGLE_API_KEY not found in .env")
    exit()

genai.configure(api_key=api_key)

m = genai.GenerativeModel("gemini-2.5-flash")

txt = read_pdf("sample.pdf")

add_doc(txt)

q = "What is Sujal's CGPA?"

ctx = search(q)

p = f"""
Answer the question using only the given context.

Context:
{ctx}

Question:
{q}
"""

r = m.generate_content(p)

print("\nAnswer:")
print(r.text)