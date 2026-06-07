from agents.risk_agent import assess_risk
from mcp.pdf_reader import read_pdf

txt = read_pdf("sample.pdf")

r = assess_risk(txt)

print(r)