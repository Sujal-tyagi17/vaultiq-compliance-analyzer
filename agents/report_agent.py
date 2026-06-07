def generate_report(r):

    s = f"""
Compliance Report

Risk Score: {r['score']}%

Identified Gaps:
"""

    for g in r["gaps"]:
        s += f"\n- {g}"

    s += """

Recommendations:
- Add Encryption Policy
- Define Data Retention Rules
- Implement User Consent Procedures
"""

    return s