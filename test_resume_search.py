from mcp.pdf_reader import read_pdf
from mcp.vector_db import add_doc, search

txt = read_pdf("sample.pdf")

add_doc(txt)

print(search("What is Sujal's CGPA?"))