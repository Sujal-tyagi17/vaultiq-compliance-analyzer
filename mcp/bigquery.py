from google.cloud import bigquery
from datetime import datetime
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "service-account.json"

PROJECT_ID = "compliance-analyzer-498710"
TABLE_ID = f"{PROJECT_ID}.compliance_db.reports"

client = bigquery.Client(project=PROJECT_ID)

def save_report(score, gaps, report):
    try:
        rows = [{
            "timestamp": datetime.utcnow().isoformat(),
            "risk_score": score,
            "gaps": ", ".join(gaps),
            "report": report
        }]

        errors = client.insert_rows_json(TABLE_ID, rows)

        if errors:
            print("BigQuery Errors:", errors)
            return False

        print("Report saved to BigQuery")
        return True

    except Exception as e:
        print("BigQuery Sandbox Limitation:", e)
        return False