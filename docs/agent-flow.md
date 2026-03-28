# NyaySathi Agent Flow

## Multi-Agent Complaint Processing Architecture

The AI service uses a multi-agent architecture with specialized agents for different aspects of legal complaint processing.

## Agents

### 1. Intake Agent
- **Purpose**: Initial complaint validation and categorization
- **Input**: Raw complaint data
- **Output**: Validated complaint with confirmed category
- **Process**:
  - Validate complaint structure
  - Confirm category classification
  - Check for completeness

### 2. Legal Agent
- **Purpose**: Deep legal analysis of the complaint
- **Input**: Validated complaint
- **Output**: Legal analysis with applicable laws and issues
- **Process**:
  - Identify applicable laws and regulations
  - Extract key legal issues
  - Assess legal merit
  - Prepare legal arguments

### 3. Drafting Agent
- **Purpose**: Create formal legal documents
- **Input**: Legal analysis results
- **Output**: Draft complaint document
- **Process**:
  - Structure formal complaint
  - Write statement of facts
  - Articulate legal arguments
  - Specify relief sought

### 4. Compliance Agent
- **Purpose**: Check regulatory compliance
- **Input**: Complaint and draft document
- **Output**: Compliance verification report
- **Process**:
  - GDPR compliance check
  - Data protection verification
  - Jurisdictional applicability
  - Regulatory requirements

### 5. Priority Agent
- **Purpose**: Assess urgency and priority level
- **Input**: Complaint with legal analysis
- **Output**: Priority score (0-1)
- **Process**:
  - Evaluate urgency indicators
  - Assess legal significance
  - Consider harm severity
  - Calculate priority score

### 6. Action Agent
- **Purpose**: Recommend next steps and escalation
- **Input**: Complete analysis with priority
- **Output**: Action recommendations
- **Process**:
  - Recommend immediate actions
  - Suggest follow-up steps
  - Determine escalation needs
  - Prepare escalation criteria

## Workflow Sequence

```
Complaint Input
    ↓
┌─────────────────┐
│ Intake Agent    │ → Validate & categorize
└────────┬────────┘
         ↓
┌─────────────────┐
│ Legal Agent     │ → Legal analysis
└────────┬────────┘
         ↓
┌─────────────────┐
│ Drafting Agent  │ → Draft document
└────────┬────────┘
         ↓
┌─────────────────┐
│ Compliance Agent│ → Compliance check
└────────┬────────┘
         ↓
┌─────────────────┐
│ Priority Agent  │ → Assess priority
└────────┬────────┘
         ↓
┌─────────────────┐
│ Action Agent    │ → Recommend actions
└────────┬────────┘
         ↓
    Final Result
        ↓
   Save to DB
```

## State Management

Each agent receives and updates a `ComplaintState` object:

```python
class ComplaintState:
  complaint_id: str
  title: str
  description: str
  category: str
  legal_analysis: dict
  draft_document: str
  priority_score: float
  compliance_check: dict
  recommended_actions: list
  escalation_needed: bool
  current_stage: str
  status: str
```

## Error Handling

- Agents log errors without halting the workflow
- Failed agents allow subsequent agents to proceed with partial data
- Final result includes error summary
- Escalation flagged if critical errors occur

## Integration with Backend

1. Backend receives complaint via REST API
2. Backend sends complaint to Python AI service
3. AI service processes through workflow graph
4. AI service returns structured results
5. Backend saves results to database
6. Frontend receives updates in real-time
