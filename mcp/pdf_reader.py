from pypdf import PdfReader

def read_pdf(fp):
    r = PdfReader(fp)
    txt = ""

    for p in r.pages:
        t = p.extract_text()
        if t:
            txt += t + "\n"

    return txt