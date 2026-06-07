from mcp.pdf_reader import read_pdf
from mcp.vector_db import add_doc

def ingest(fp):

    txt = read_pdf(fp)

    add_doc(txt)

    return {
        "status": "indexed"
    }