def assess_risk(txt):

    score = 100
    gaps = []

    if "encryption" not in txt.lower():
        score -= 20
        gaps.append("Missing Encryption Policy")

    if "retention" not in txt.lower():
        score -= 20
        gaps.append("Missing Data Retention Policy")

    if "consent" not in txt.lower():
        score -= 20
        gaps.append("Missing User Consent Policy")

    return {
        "score": score,
        "gaps": gaps
    }