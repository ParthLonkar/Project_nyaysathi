import { logger } from '../utils/logger.js';

/**
 * Escalation Triggers
 */
const ESCALATION_TRIGGERS = {
  SLA_BREACH: 'sla_breach',
  NO_RESPONSE: 'no_response',
  POOR_RESOLUTION: 'poor_resolution',
  CITIZEN_COMPLAINT: 'citizen_complaint',
  CORRUPTION_ALLEGATION: 'corruption_allegation',
};

/**
 * Escalation Levels
 */
const ESCALATION_LEVELS = {
  LEVEL_1: 'department_manager', // Department manager review
  LEVEL_2: 'commissioner', // Divisional commissioner
  LEVEL_3: 'minister', // Ministry/Minister level
  LEVEL_4: 'ombudsman', // Ombudsman/National authority
};

/**
 * Check if escalation should be triggered
 */
function shouldEscalate(complaintData, history) {
  const triggers = [];

  // Check SLA breach
  if (complaintData.slaBreach && complaintData.slaBreach.isBreached) {
    triggers.push({
      trigger: ESCALATION_TRIGGERS.SLA_BREACH,
      severity: 'high',
      daysBreach: complaintData.slaBreach.elapsedDays - complaintData.slaBreach.slaInDays,
    });
  }

  // Check for no response (same state for too long)
  if (complaintData.daysSinceUpdate > 14) {
    triggers.push({
      trigger: ESCALATION_TRIGGERS.NO_RESPONSE,
      severity: 'high',
      daysSinceUpdate: complaintData.daysSinceUpdate,
    });
  }

  // Check citizen satisfaction feedback
  if (complaintData.satisfaction && complaintData.satisfaction < 3) {
    triggers.push({
      trigger: ESCALATION_TRIGGERS.POOR_RESOLUTION,
      severity: 'medium',
      satisfactionScore: complaintData.satisfaction,
    });
  }

  // Check for escalation request from citizen
  if (complaintData.escalationRequested) {
    triggers.push({
      trigger: ESCALATION_TRIGGERS.CITIZEN_COMPLAINT,
      severity: 'medium',
    });
  }

  return {
    shouldEscalate: triggers.length > 0,
    triggers,
    totalTriggers: triggers.length,
  };
}

/**
 * Determine escalation level based on triggers
 */
function determineEscalationLevel(triggers) {
  const criticalTriggers = triggers.filter(t => t.severity === 'high').length;

  if (criticalTriggers >= 2) {
    return ESCALATION_LEVELS.LEVEL_3; // Ministry level
  } else if (criticalTriggers === 1) {
    return ESCALATION_LEVELS.LEVEL_2; // Commissioner level
  } else {
    return ESCALATION_LEVELS.LEVEL_1; // Manager level
  }
}

/**
 * Generate follow-up letter template
 */
function generateFollowUpLetter(complaintData) {
  const { title, description, respondentName, daysSinceSubmission } = complaintData;

  const letter = `
URGENT FOLLOW-UP: COMPLAINT NOT RESOLVED

Reference ID: ${complaintData.complaintId || 'PENDING'}
Date: ${new Date().toISOString().split('T')[0]}
Days Since Original Submission: ${daysSinceSubmission}

Dear Sir/Madam,

This is a formal follow-up regarding the complaint filed on ${complaintData.submittedAt} which has not received adequate response or resolution.

**Original Complaint Summary:**
Title: ${title}
Category: ${complaintData.category}
Against: ${respondentName}

**Issue:** Your complaint has been pending for ${daysSinceSubmission} days without satisfactory progress or resolution.

**Action Required:**
You are requested to provide:
1. Current status of complaint resolution
2. Detailed action taken so far
3. Expected completion date
4. Reason for delay, if any

**Escalation Notice:**
If satisfactory response is not received within 7 days, this complaint will be automatically escalated to the higher authority and may result in:
- Formal investigation
- Penalty/fine to responsible officers
- Disciplinary action
- Public disclosure of non-compliance

Yours faithfully,
NyaySathi AI System
Government Grievance Resolution Platform
`;

  return letter.trim();
}

/**
 * Generate escalation letter to higher authority
 */
function generateEscalationLetter(complaintData, previousLevel) {
  const { title, description, respondentName } = complaintData;

  const letter = `
FORMAL ESCALATION NOTICE

Reference ID: ${complaintData.complaintId || 'PENDING'}
Original Date: ${complaintData.submittedAt}
Escalation Date: ${new Date().toISOString().split('T')[0]}
Previous Level: ${previousLevel}

Dear Sir/Madam,

This is to formally escalate a citizen complaint that has not been resolved at the departmental level.

**Complaint Details:**
Title: ${title}
Category: ${complaintData.category}
Against: ${respondentName || 'N/A'}

**Escalation Reason:** 
${complaintData.escalationReason || 'Persistent non-compliance and SLA breach'}

**Citizen Details:**
Name: ${complaintData.fullName}
Phone: ${complaintData.phone}
Email: ${complaintData.email}

**Relief Sought:**
The citizen seeks:
1. Immediate resolution of the underlying issue
2. Compensation for delays and inconvenience
3. Investigation into departmental inaction
4. Preventive measures to avoid recurrence

**Required Actions:**
Please investigate the complaint and provide your response within 7 days.

This escalation has been automatically triggered by the NyaySathi AI Governance System.

Regards,
NyaySathi Platform
`;

  return letter.trim();
}

/**
 * Check if auto-escalation should happen
 */
function checkAutoEscalation(complaintData) {
  const autoEscalationCriteria = {
    slaBreach: complaintData.slaBreach && complaintData.slaBreach.isBreached && complaintData.slaBreach.elapsedDays > complaintData.slaBreach.slaInDays + 7, // 7 days past SLA
    noResponseFor14Days: complaintData.daysSinceUpdate > 14,
    corruptionAllegation: complaintData.description && complaintData.description.toLowerCase().includes('corruption'),
  };

  return {
    shouldAutoEscalate: Object.values(autoEscalationCriteria).some(v => v === true),
    criteria: autoEscalationCriteria,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create escalation record
 */
function createEscalationRecord(complaintData, trigger, level) {
  return {
    escalationId: `ESC-${Date.now()}`,
    complaintId: complaintData.complaintId,
    trigger,
    previousLevel: complaintData.currentLevel,
    newLevel: level,
    escalatedAt: new Date().toISOString(),
    escalatedBy: 'automatic_system', // or user email
    reason: `Escalated due to ${trigger}`,
    followUpLetter: generateFollowUpLetter(complaintData),
    escalationLetter: generateEscalationLetter(complaintData, complaintData.currentLevel),
  };
}

export {
  ESCALATION_TRIGGERS,
  ESCALATION_LEVELS,
  shouldEscalate,
  determineEscalationLevel,
  generateFollowUpLetter,
  generateEscalationLetter,
  checkAutoEscalation,
  createEscalationRecord,
};
