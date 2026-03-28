INTAKE_PROMPT = """
Analyze the following legal complaint for intake processing:

Title: {title}
Description: {description}
Category: {category}

Validate the complaint and confirm the category. Provide structured feedback.
"""

LEGAL_ANALYSIS_PROMPT = """
Perform a detailed legal analysis of the following complaint:

Title: {title}
Description: {description}
Category: {category}

Identify:
1. Applicable laws and regulations
2. Key legal issues
3. Potential arguments
4. Strength of the case
"""

DRAFTING_PROMPT = """
Based on the legal analysis below, draft a formal legal document:

Title: {title}
Legal Analysis: {legal_analysis}

Create a professional legal document including:
1. Statement of facts
2. Legal arguments
3. Relief sought
"""

COMPLIANCE_PROMPT = """
Check regulatory compliance for:

Title: {title}
Category: {category}

Verify:
1. GDPR compliance if applicable
2. Data protection requirements
3. Jurisdictional applicability
"""

PRIORITY_PROMPT = """
Assess the priority and urgency of this complaint:

Title: {title}
Description: {description}
Legal Analysis: {legal_analysis}

Provide a priority score (0-1) and reasoning.
"""

ACTION_PROMPT = """
Recommend actions and escalation for:

Title: {title}
Legal Analysis: {legal_analysis}
Priority Score: {priority}

Recommend:
1. Immediate actions
2. Follow-up steps
3. Escalation requirements
"""
