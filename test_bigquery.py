from mcp.bigquery import save_report

e = save_report(
    40,
    ["Missing Encryption Policy"],
    "Test Report"
)

print(e)